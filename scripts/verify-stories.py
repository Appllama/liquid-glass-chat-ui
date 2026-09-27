"""Check six-second stories with direct HID input on an iPhone 17 Pro.

Requires fb-idb 1.6.1 and a companion listening on IDB_PORT (default 10981).
Set SIMULATOR_UDID to the companion's device. Evidence stays under .qa/.
"""
import asyncio
import json
import logging
import os
from pathlib import Path
import signal
import subprocess
import time

from idb.grpc.client import Client
from idb.common.types import TCPAddress, AccessibilityInfoOptions, AccessibilityBackend

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / '.qa' / 'stories-direct'
UDID = os.environ['SIMULATOR_UDID']
APP = 'io.appllama.liquidglasschat'

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with Client.build(TCPAddress('127.0.0.1', int(os.getenv('IDB_PORT', '10981'))), logging.getLogger('stories')) as client:
        assert client.companion.udid == UDID, 'Companion must target the selected test device'
        async def tree():
            return json.loads((await client.accessibility_info(None, AccessibilityInfoOptions(backend=AccessibilityBackend.AX))).json)
        async def expect(label, visible=True):
            found = any(item.get('AXLabel') == label for item in await tree())
            assert found == visible, f'{label}: expected visible={visible}'
        async def tap(label):
            matches = [item for item in await tree() if item.get('AXLabel') == label]
            assert matches, f'Missing control: {label}'
            frame = matches[-1]['frame']
            await client.tap(frame['x'] + frame['width']/2, frame['y'] + frame['height']/2)
        async def shot(name):
            process = await asyncio.create_subprocess_exec('xcrun', 'simctl', 'io', UDID, 'screenshot', str(OUT / f'{name}.png'), stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
            assert await process.wait() == 0
        await client.terminate(APP)
        await client.launch(APP)
        await asyncio.sleep(2.5)
        await tap('Cookbook 1 (Fable)')
        await asyncio.sleep(.8)
        await tap('Show stories')
        await asyncio.sleep(.8)
        with (OUT / 'record.log').open('w') as log:
            recorder = subprocess.Popen(['xcrun', 'simctl', 'io', UDID, 'recordVideo', '--codec=h264', '--force', str(OUT / 'stories.mp4')], stdout=log, stderr=log)
            await asyncio.sleep(.6)
            began = time.monotonic()
            events = []
            def mark(name):
                events.append({'seconds': round(time.monotonic()-began, 3), 'event': name})
            try:
                mark('Open and close')
                await tap("Mara Lindqvist's story")
                await asyncio.sleep(.6)
                await expect('Close')
                await shot('story-open')
                await tap('Close')
                await asyncio.sleep(.35)
                await expect('Close', False)
                await expect("Mara Lindqvist's story")
                mark('Like and reply')
                await tap("Mara Lindqvist's story")
                await asyncio.sleep(.6)
                await tap('Like story')
                await expect('Unlike story')
                await shot('story-liked')
                await tap('Reply to Mara')
                await asyncio.sleep(.8)
                await expect('Share a photo')
                await expect('Close', False)
                await shot('story-reply')
                await tap('Back')
                await asyncio.sleep(.6)
                mark('Drag to dismiss')
                await tap("Mara Lindqvist's story")
                await asyncio.sleep(.6)
                await expect('Unlike story')
                await client.swipe((201, 350), (201, 720), duration=.35)
                await asyncio.sleep(.4)
                await expect('Close', False)
                await expect("Mara Lindqvist's story")
                await shot('story-dismissed')
                mark('Passed')
            finally:
                recorder.send_signal(signal.SIGINT)
                recorder.wait(timeout=15)
                (OUT / 'events.json').write_text(json.dumps(events, indent=2) + '\n')
        print('PASS: manual close, like state, reply navigation, and drag dismissal')

asyncio.run(main())
