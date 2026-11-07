---
project: school-bot
updated: 2026-11-06
status: Proposed (schema v0.1 · ให้ dev ทบทวนก่อนใช้)
---

# 9. Configuration Schema

## 9.1 สามชั้นของ config

| ชั้น | อยู่ที่ | ใครเขียน | ตัวอย่าง field |
|---|---|---|---|
| **Shared** (ทุก game definition) | ราก | ระบบ | `schema_version`, `game_id`, `experience_type`, `title_key`, `skills`, `engines`, `theme_pack`, `hint_configuration`, `reward_configuration`, `save` |
| **Game-specific** | `engine_configuration.<engine>` + `levels[]` | ผู้ออกแบบเกม | `grid`, `available_blocks`, `block_budget`, `arm`, `joystick`, `robot_model`, `objects`, `success_conditions` |
| **Lesson-specific** | `lesson` (มีเฉพาะ `experience_type: "lesson"`) | ผู้ออกแบบบทเรียน | `grade`, `term`, `unit_ref` (ชี้แถวใน S1), `stage_index`, `learning_objectives`, `star_rule`, `report_to_teacher` |

กติกา:
- **ใช้ engine เดิมกับเกมใหม่:** `engines` ประกาศ engine ที่ต้องโหลด · `engine_configuration` ตั้งค่า · โค้ด engine ไม่รู้จัก `game_id`
- **เพิ่ม variation:** `levels[]` override เฉพาะ field ที่ต่าง (deep-merge บน `engine_configuration`) · `generator` สร้างด่านสุ่มจาก seed · `difficulty_profile` อ้างชุดค่าที่ตั้งชื่อไว้
- **ข้อความ:** เก็บเป็น key (`*_key`) แปลได้ 3 ภาษา (quiz R11) ไม่ฝังข้อความไทยใน config
- **ค่าภาพ/สี:** อ้าง `theme_pack` ที่ทำจาก DS เท่านั้น ไม่มี hex ใน config
- **success_conditions:** รายการ predicate ของ Evaluator (`all` / `any` / `not`) ใช้ได้ทุก world

## 9.2 Predicate ของ Evaluator (ชุดเริ่มต้น)

`reach_cell(x,y)` · `collected_all(type)` · `block_count_lte(n)` · `edit_count_lte(n)` · `object_in_zone(object, zone)` · `zone_by_property(property)` · `time_lte(sec)` · `moves_lte(n)` · `circuit_ok` · `no_damage` · `port_powered(port)` · `accuracy_gte(pct)` · `program_terminates` · `pose_matches(tolerance_deg)` · `returned_to_neutral`

## 9.3 กรณีที่ 1: Lesson · Grid Path Navigator แบบจำกัดบล็อก

```json
{
  "schema_version": "0.1",
  "game_id": "lesson.l1.u01.s02.grid-first-steps",
  "experience_type": "lesson",
  "category": ["robot_adventure", "block_coding"],
  "title_key": "game.grid_first_steps.title",
  "skills": ["sequencing"],
  "engines": ["block_editor", "program_runtime", "grid_world"],
  "theme_pack": "theme.level1.ai",
  "lesson": {
    "grade": 1,
    "term": 1,
    "unit_ref": "S1:P1:U1",
    "stage_index": 2,
    "learning_objectives": [
      { "id": "LO1", "text_key": "lo.sequence_simple_commands", "source": "S2:P1:U1" }
    ],
    "star_rule": "none",
    "report_to_teacher": true
  },
  "engine_configuration": {
    "block_editor": {
      "palette": ["move_forward", "turn_left", "turn_right"],
      "block_style": "icon_only",
      "max_program_length": 8
    },
    "program_runtime": {
      "tick_ms": 600,
      "step_mode": true,
      "count_budget_by": "blocks_in_program"
    },
    "grid_world": {
      "size": { "cols": 5, "rows": 4 },
      "start": { "x": 0, "y": 3, "facing": "east" },
      "goal": { "x": 3, "y": 1 },
      "obstacles": [{ "x": 2, "y": 3 }],
      "items": [{ "type": "battery", "x": 1, "y": 3 }],
      "on_collision": "stop_and_highlight"
    }
  },
  "levels": [
    {
      "level_id": "beginner",
      "difficulty_profile": "p1_beginner",
      "block_budget": null,
      "overrides": { "grid_world": { "obstacles": [], "items": [] } },
      "success_conditions": { "all": [{ "reach_cell": { "x": 3, "y": 1 } }] }
    },
    {
      "level_id": "intermediate",
      "difficulty_profile": "p1_intermediate",
      "block_budget": { "value": 6, "mode": "bonus_goal" },
      "success_conditions": { "all": [{ "reach_cell": { "x": 3, "y": 1 } }] },
      "bonus_goals": [
        { "all": [{ "reach_cell": { "x": 3, "y": 1 } }] },
        { "all": [{ "collected_all": "battery" }] },
        { "all": [{ "block_count_lte": 6 }] }
      ]
    }
  ],
  "hint_configuration": {
    "trigger": { "failed_runs": 2, "idle_sec": 45 },
    "tiers": [
      { "type": "point_at", "target": "first_wrong_block" },
      { "type": "concept", "text_key": "hint.one_block_one_step", "mascot_pose": "thinking" },
      { "type": "demo_step", "steps": 1 }
    ]
  },
  "reward_configuration": { "stars_max": 0, "unlock_in_library": ["library.g1.shortcut-bot"] },
  "save": { "resume": false, "store": "my_work_cloud" }
}
```

หมายเหตุ: บทเรียนไม่มี resume (quiz ST-14 · OQ54) · ด่านผสมมีข้อแบบฝึก 3 ข้อ ดาว = ข้อที่ถูก (quiz R4 · OQ50)

## 9.4 กรณีที่ 2: Free Play · Robot Arm Joystick Simulator

```json
{
  "schema_version": "0.1",
  "game_id": "library.g2.claw-rush",
  "experience_type": "free_play",
  "category": ["robot_adventure"],
  "title_key": "game.claw_rush.title",
  "skills": ["direction_mapping", "pick_and_place", "sorting"],
  "engines": ["joystick_input", "arm_world"],
  "theme_pack": "theme.factory.default",
  "engine_configuration": {
    "joystick_input": {
      "sources": ["virtual_stick", "gamepad", "keyboard"],
      "return_to_neutral": true,
      "dead_zone": 0.15,
      "axis_pairs": {
        "A": { "x": "S0_base", "y": "S1_shoulder" },
        "B": { "x": "S3_wrist", "y": "S2_elbow" }
      },
      "buttons": { "grip_toggle": "S5_gripper", "pair_switch": true }
    },
    "arm_world": {
      "view": { "main": "side_2d", "inset": "top_2d" },
      "joints": {
        "S0_base":     { "min_deg": -180, "max_deg": 180, "max_speed_dps": 60 },
        "S1_shoulder": { "min_deg": -135, "max_deg": 135, "max_speed_dps": 45 },
        "S2_elbow":    { "min_deg": -135, "max_deg": 135, "max_speed_dps": 45 },
        "S3_wrist":    { "min_deg": -135, "max_deg": 135, "max_speed_dps": 60 },
        "S5_gripper":  { "unit": "percent", "min": 0, "max": 100 }
      },
      "angle_display": "arc_only",
      "limit_feedback": ["arc_warning", "shake"],
      "hardware_link": {
        "enabled": false,
        "show_commanded_layer": true,
        "show_reported_layer": "only_if_device_reports_position"
      }
    }
  },
  "levels": [
    {
      "level_id": "basic",
      "difficulty_profile": "stick_one_axis",
      "overrides": {
        "joystick_input": { "enabled_axes": ["S0_base"], "sensitivity": 0.4 },
        "arm_world": { "objects": [], "targets": [{ "type": "ghost_pose", "S0_base": 90 }] }
      },
      "success_conditions": { "all": [{ "pose_matches": { "tolerance_deg": 10 } }, { "returned_to_neutral": true }] }
    },
    {
      "level_id": "advanced",
      "difficulty_profile": "pick_place",
      "overrides": {
        "joystick_input": { "enabled_axes": "all", "sensitivity": 0.7 },
        "arm_world": {
          "objects": [{ "id": "box1", "shape": "cube", "size": 3, "color_token": "theme.object.red", "at": [10, 0] }],
          "zones": [{ "id": "basket_red", "at": [-8, 0], "accepts": { "color_token": "theme.object.red" } }],
          "show_sequence_checklist": ["open", "lower", "close", "lift", "move", "release"]
        }
      },
      "success_conditions": { "all": [{ "object_in_zone": { "object": "box1", "zone": "basket_red" } }] }
    },
    {
      "level_id": "expert",
      "difficulty_profile": "sorting_timed",
      "generator": { "type": "random_objects", "count": 6, "properties": ["color"], "seed": "daily" },
      "success_conditions": { "all": [{ "zone_by_property": "color" }, { "time_lte": 90 }] },
      "bonus_goals": [
        { "all": [{ "zone_by_property": "color" }] },
        { "all": [{ "time_lte": 90 }] },
        { "all": [{ "moves_lte": 40 }] }
      ]
    }
  ],
  "modes": ["play", "daily_random", "free"],
  "hint_configuration": { "trigger": { "idle_sec": 30 }, "tiers": [{ "type": "highlight_axis" }, { "type": "ghost_path" }] },
  "reward_configuration": { "personal_best": ["time", "moves"], "report_to_teacher": false },
  "save": { "resume": false, "store": "my_work_cloud" }
}
```

หมายเหตุ: ช่วงมุมตาม arm-lab R13 · `S4` (ข้อมือหมุน) ไม่ผูกกับจอยใน config นี้ (ตั้งใจลดแกนสำหรับเด็ก) · `hardware_link.enabled: false` จนกว่าตอบ Q6

## 9.5 กรณีที่ 3: Free Play · Circuit + Program + Mechanic Integration

```json
{
  "schema_version": "0.1",
  "game_id": "library.g13.mission-builder.m03",
  "experience_type": "free_play",
  "category": ["creative_workshop", "robot_adventure", "circuit_lab"],
  "title_key": "game.mission_builder.m03.title",
  "skills": ["system_thinking", "circuit_basic", "sequencing", "mechanism_choice"],
  "engines": ["circuit_world", "block_editor", "program_runtime", "robot_model", "grid_world"],
  "theme_pack": "theme.warehouse",
  "engine_configuration": {
    "robot_model": {
      "controller": "uno_like",
      "power": { "source": "battery_pack", "voltage": 6 },
      "slots": {
        "drive": { "choices": ["wheel_small", "wheel_large"], "required": true },
        "tool": { "choices": ["gripper_small", "gripper_wide", "none"], "required": true }
      },
      "mechanics": {
        "wheel_small": { "cells_per_sec": 1.0, "torque": "high" },
        "wheel_large": { "cells_per_sec": 2.0, "torque": "low", "fails_on": ["ramp"] },
        "gripper_small": { "max_object_size": 2 },
        "gripper_wide": { "max_object_size": 4 }
      },
      "fault_trace": true
    },
    "circuit_world": {
      "mode": "guided_ports",
      "parts": ["battery_pack", "motor_left", "motor_right", "servo_gripper", "wire"],
      "ports": ["D5", "D6", "D9"],
      "damage_model": "block_lab_r5",
      "locked_connections": [{ "from": "battery_pack", "to": "controller.vin" }]
    },
    "block_editor": {
      "palette": ["drive_forward", "turn_left", "turn_right", "servo_set", "wait", "repeat"],
      "port_aware": true
    },
    "program_runtime": { "tick_ms": 400, "step_mode": true, "count_budget_by": "blocks_in_program" },
    "grid_world": {
      "size": { "cols": 8, "rows": 6 },
      "start": { "x": 0, "y": 5, "facing": "north" },
      "terrain": [{ "type": "ramp", "x": 3, "y": 2 }],
      "objects": [{ "id": "crate", "size": 3, "x": 4, "y": 1 }],
      "zones": [{ "id": "dock", "x": 7, "y": 0 }]
    }
  },
  "levels": [
    {
      "level_id": "intermediate",
      "difficulty_profile": "integration_guided",
      "success_conditions": {
        "all": [
          { "circuit_ok": true },
          { "no_damage": true },
          { "object_in_zone": { "object": "crate", "zone": "dock" } },
          { "program_terminates": true }
        ]
      },
      "bonus_goals": [
        { "all": [{ "object_in_zone": { "object": "crate", "zone": "dock" } }] },
        { "all": [{ "no_damage": true }] },
        { "all": [{ "block_count_lte": 10 }] }
      ]
    }
  ],
  "fault_messages": {
    "no_power_to_port": "fault.circuit.no_power",
    "program_uses_unwired_port": "fault.program.unwired_port",
    "tool_too_small": "fault.mechanic.tool_too_small",
    "drive_cannot_climb": "fault.mechanic.cannot_climb"
  },
  "modes": ["play", "free"],
  "hint_configuration": {
    "trigger": { "failed_runs": 2 },
    "tiers": [{ "type": "fault_trace_focus" }, { "type": "concept", "text_key": "hint.check_layer" }]
  },
  "reward_configuration": { "personal_best": ["blocks", "parts"], "report_to_teacher": false },
  "save": { "resume": true, "store": "my_work_cloud" }
}
```

จุดที่ทำให้ 3 ระบบมีผลต่อกันใน config นี้: `crate.size: 3` → `gripper_small` (2) คีบไม่ได้ · `ramp` → `wheel_large` ขึ้นไม่ได้ · `port_aware` → บล็อก `servo_set D9` ใช้ไม่ได้ถ้าไม่ได้ต่อ servo ที่ D9 · ทั้งหมดรายงานผ่าน `fault_trace`
