# Navigation Contracts and Primary Sources

Read on 2026-11-07. Resolve these `stable` links to the project's engine branch for
version-specific behavior. Navigation agent class references currently mark their
APIs experimental; a minor-version upgrade still needs project verification.

| Topic | Primary source | Use |
|---|---|---|
| Map timing | [Using NavigationServer](https://docs.godotengine.org/en/stable/tutorials/navigation/navigation_using_navigationservers.html) | Queued map changes and synchronization before path queries |
| Agent following | [Using NavigationAgents](https://docs.godotengine.org/en/stable/tutorials/navigation/navigation_using_navigationagents.html) | Following lifecycle, completion, distance thresholds and repeated-path problems |
| 2D agent | [NavigationAgent2D](https://docs.godotengine.org/en/stable/classes/class_navigationagent2d.html) | Active physics-step path updates, layers, avoidance and callback restrictions |
| 3D agent | [NavigationAgent3D](https://docs.godotengine.org/en/stable/classes/class_navigationagent3d.html) | Dimension-specific movement, clearance-related properties and avoidance |

For diagnosis, bind each observation to its layer. An empty map, a disconnected
route, a collider blocking the actor and two agents failing to yield have different
causes. Inspect the first failing boundary before changing unrelated thresholds.

For procedural navigation, distinguish geometry creation, bake completion, map
registration and synchronized query results. For multithreaded baking, use the
completion mechanism supported by the actual version; do not replace it with a
constant sleep. A test should identify which map/region changed and the expected
before/after reachability.
