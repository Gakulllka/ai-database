---
name: godot-networking
description: "Design and verify Godot multiplayer transport, authority, replication and connection lifecycle. Use for networked 2D/3D gameplay, RPCs and multiplayer defects."
metadata:
  origin: "Database: verified Godot primary documentation"
---

# Godot Networking

## When to Activate

Add or change multiplayer behavior, diagnose synchronization/RPC failures, or select
a transport for an actual export target. This workflow applies to both 2D and 3D;
it does not imply that a single-player game needs networking.

## Establish the Network Contract

Read the project's Godot version, scripting language, topology, peer lifecycle and
target platforms. Record who owns simulation, accepts input, validates outcomes and
persists progression. Select matching-version APIs using the
[transport and API references](references/network-contracts.md).

Distinguish ENet, WebSocket and WebRTC from the high-level scene/RPC API using them.
Browser exports cannot be assumed to expose desktop TCP/UDP capabilities. Verify
WebRTC native dependencies, signaling and connection requirements for the selected
version/targets; do not add a native plugin or signaling service implicitly.

## Implement Authority and Replication

- Treat client messages as requests. Validate the actual sender, object ownership,
  action state, values, rate and sequence before authoritative state changes.
- Read `get_remote_sender_id()` inside the RPC and retain the value before delayed
  work. A payload's claimed player ID is not proof of its sender.
- Keep RPC declarations and participating scene paths consistent across peers.
  Verify authority assignments on every peer, including newly spawned objects.
- Choose call-local/remote behavior explicitly for a host that also plays. Match
  transfer reliability and channels to ordering, loss and latency requirements.
- Use spawn/replication mechanisms only for their documented properties and
  visibility rules. Validate application ownership and permissions separately.
- Keep gameplay state separate from presentation interpolation. Specify how input,
  snapshots, prediction/reconciliation and RNG interact only where needed by the
  game's actual consistency model.

Use GDScript annotations or C# attributes and bindings appropriate to the project;
do not translate names or types mechanically. Verify mixed-language RPC contracts
in an actual peer session when used.

## Connection Lifecycle and Evidence

Define initial state, scene-load readiness, late join, disconnect cleanup, duplicate
requests and reconnect behavior. Reconnect should not duplicate rewards, actors or
event subscriptions. Dispose peer-owned state without altering another peer's data.

Start with a bounded local session when authorized. Test separate processes and
actual exported targets, not only two APIs inside one editor process. Exercise
latency/loss where relevant, rejected sender/actions, host/client differences,
join-in-progress and clean shutdown. Local success does not prove Internet reachability.
Report the engine/build, transport, process count, topology and observed assertions.

Use isolated ports and synthetic accounts/state for tests. Source work does not
authorize opening router/firewall ports, deploying a public server or contacting
production services; preserve the user's existing action scope.

## Anti-Patterns

- Making an RPC `any_peer` merely to suppress an authority error.
- Trusting client positions, damage, inventory or rewards without authority checks.
- Assuming matching RPC names alone establish a compatible scene protocol.
- Treating a local networking smoke as proof of exported/browser compatibility.
- Copying a tutorial server into a release with guessed credentials or open ports.

## Related Skills

[godot-development](../godot-development/SKILL.md),
[godot-scenes-resources](../godot-scenes-resources/SKILL.md),
[godot-testing](../godot-testing/SKILL.md),
[godot-export](../godot-export/SKILL.md).
