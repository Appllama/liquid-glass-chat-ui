# Asset provenance

Only runtime assets and documentation artwork belong in this repository. The supplied comparison image, source recordings, research screenshots, rejected artwork, and Expo starter graphics are excluded.

| Location | Content | Origin |
| --- | --- | --- |
| `assets/cookbooks/fable/avatars/` | 14 portrait and team images | Supplied Fable source artwork; original portrait prompts were not retained. |
| `assets/cookbooks/fable/stories/` | 13 vertical story photographs | Generated for Fable. The exact selected prompts, reference requirements, and recorded generation settings are in `prompts/fable-artwork.md`. |
| `assets/cookbooks/astra/portraits/` | Nine fictional adult portraits | Generated original nine-cell portrait sheet, split into local portraits. |
| `assets/cookbooks/astra/photos/coast.png` | Coastal landscape | Generated original coastal photograph. |
| `assets/images/icon.png` | Three glass spheres | Original procedural app mark from the Astra source. |
| `docs/images/appllama-logo-*.png` | Appllama light/dark branding | Appllama's Liquid Glass Screens repository. |
| `docs/images/*-inbox.png`, `*-stories.png`, `*-circle.png`, `*-chat.png` | Cookbook previews | Direct simulator captures of this repository. |

The SHA-256 inventory in `asset-manifest.json` covers runtime artwork. `npm test` checks that each file exists, matches its checksum, and is referenced by the runtime code or app configuration. Story assets for contacts without an active story can be shared from their conversation.

Astra asset descriptions are retained in `prompts/astra-artwork.md`; where an exact original prompt was unavailable, the replacement recipe is labeled accordingly. Generated people and conversations are sample content. Branding rights are separate from the source license.
