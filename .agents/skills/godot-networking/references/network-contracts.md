# Network Contracts and Primary Sources

Read on 2026-11-07. These links use Godot's moving `stable` alias. Match the
project's actual engine branch before copying an API, annotation or target claim.
The WebRTC tutorial currently carries an update warning; confirm its details
against the selected engine and native extension versions.

| Decision | Primary source | What to check |
|---|---|---|
| Scene/RPC contract | [High-level multiplayer](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html) | Peer setup, NodePaths, RPC declaration consistency, transfer modes, channels and connection signals |
| Sender identity | [MultiplayerAPI](https://docs.godotengine.org/en/stable/classes/class_multiplayerapi.html) | Sender ID belongs to the active RPC context; retain it before awaiting/deferred work |
| Node authority | [Node](https://docs.godotengine.org/en/stable/classes/class_node.html) | Authority assignment API and subtree/spawn lifecycle for the selected version |
| Browser/native WebSocket | [Using WebSockets](https://docs.godotengine.org/en/stable/tutorials/networking/websocket.html) | Supported peer implementation, polling, secure connection and target permissions |
| WebRTC | [WebRTC](https://docs.godotengine.org/en/stable/tutorials/networking/webrtc.html) | Signaling, peer setup and browser versus native implementation requirements |

Separate the engine's peer identity from the game's account/session identity.
Document the application's authentication and reconnect mapping rather than
assuming that a numerical peer ID is a persistent account identifier.

For a concrete change, write a small contract table: message, permitted sender,
validated fields/state, authority, reliability/channel, duplicate handling and
observable result. This is a design aid, not a new mandatory project document.
Keep it in the existing task/spec when one exists.
