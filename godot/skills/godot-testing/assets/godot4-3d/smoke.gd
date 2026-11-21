extends Node3D

signal fixture_event

var _ticks: int = 0
var _events: int = 0
var _body: CharacterBody3D

func _fail(message: String) -> void:
	push_error(message)
	get_tree().quit(1)

func _ready() -> void:
	_body = get_node("Actor") as CharacterBody3D
	if _body == null:
		_fail("Expected CharacterBody3D")
		return
	var original := BoxShape3D.new()
	original.size = Vector3.ONE
	var independent := original.duplicate() as BoxShape3D
	independent.size = Vector3(2, 2, 2)
	if original.size != Vector3.ONE:
		_fail("Resource instances unexpectedly share mutable size")
		return
	var parent := Node.new()
	var owned := Node.new()
	var unowned := Node.new()
	parent.add_child(owned)
	owned.owner = parent
	parent.add_child(unowned)
	var packed := PackedScene.new()
	if packed.pack(parent) != OK:
		parent.free()
		_fail("Unable to pack ownership fixture")
		return
	var restored := packed.instantiate()
	var ownership_ok := restored.get_child_count() == 1
	restored.free()
	parent.free()
	if not ownership_ok:
		_fail("PackedScene ownership contract failed")
		return
	fixture_event.connect(_on_fixture_event)
	fixture_event.emit()
	fixture_event.disconnect(_on_fixture_event)
	fixture_event.emit()
	if _events != 1:
		_fail("Signal connect/disconnect contract failed")

func _on_fixture_event() -> void:
	_events += 1

func _physics_process(_delta: float) -> void:
	if _body == null:
		return
	_body.velocity = Vector3(60, 0, 0)
	_body.move_and_slide()
	_ticks += 1
	if _ticks >= 4:
		if _body.position.x <= 0.0:
			_fail("Character body did not move in physics steps")
			return
		print("ECC_GODOT_SMOKE:" + JSON.stringify({"dimension": "3D", "checks": 4, "physics_ticks": _ticks}))
		get_tree().quit(0)
