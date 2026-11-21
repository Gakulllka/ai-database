# Render Contracts and Primary Sources

Read on 2026-11-07 using the moving `stable` documentation. Open the project's
matching engine branch before relying on a feature, built-in or renderer claim.

| Topic | Primary source | Decision supported |
|---|---|---|
| Rendering methods and targets | [Overview of renderers](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html) | Separate rendering method, graphics driver and device/target support |
| Shader language | [Shading language](https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/shading_language.html) | Types, initialized locals, uniforms and version-specific syntax |
| 2D/canvas stages | [CanvasItem shaders](https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/canvas_item_shader.html) | Canvas built-ins, stage behavior and render modes |
| 3D surface stages | [Spatial shaders](https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/spatial_shader.html) | Surface inputs/outputs, transparency and lighting behavior |
| Resource sharing | [ShaderMaterial](https://docs.godotengine.org/en/stable/classes/class_shadermaterial.html) | Shared uniform changes, parameter naming and supported per-instance alternatives |

For a proposed effect, identify pipeline/type, inputs, material ownership, target
renderer support and the smallest observable acceptance case. A visual sample is a
reference for appearance, not evidence that its implementation matches the target.

Choose per-instance behavior using the class reference for the actual engine
version and node type. Availability in a current stable reference does not prove
availability in an older project's CanvasItem or GeometryInstance3D API.
