# MetaCTF — Reliability Update (Write-up)

**Category:** Reverse Engineering / Firmware Logic / Software-in-the-Loop  
**Result:** Solved  
**Flag:** `MetaCTF{th4t_w4sn7_just_a_bugf1x_nwdh757t}`

## 1. Challenge Overview

Northstar Grand Prix submitted `Control Application V5R` as a *reliability-only* update. According to the supplied release notes, the changes were supposed to consolidate driver-switch debounce blocks, adjust transient rear-position sensor diagnostics, and saturate a diagnostic counter. The team claimed there was no performance change.

Our task was to provide a driver-control schedule that proves otherwise by comparing the approved firmware with the candidate in the FIA software-in-the-loop (SIL) runner.

The challenge supplied four files:

- `approved_v5.elf` — the approved AArch64 firmware.
- `candidate_v5r.elf` — the new AArch64 firmware.
- `release_notes.pdf` — the team's description of the update.
- `rig.py` — a Python runner that executes both images using the same input schedule.

## 2. Understand the Validation Rules

Reading `rig.py` reveals that the input is a JSON object with an `events` array. Each event specifies a track position in **millimeters** and may modify `aero_request` (`corner` or `straight`) and/or `boost` (`true` or `false`).

The constraints are:

- Maximum **24** events.
- At least **3,000 mm** between consecutive events.
- The first event must be at `at_mm: 0` and initialize both controls.
- The track is **2,800,000 mm** long.
- Rear-wing activation zones are **760,000–980,000 mm** and **1,320,000–1,600,000 mm**.

Most importantly, the runner accepts the proof when:

1. Both firmware revisions complete the lap.
2. The approved revision finishes a legal lap.
3. The candidate delays the return-to-corner command by at least **400 ms** after permission is withdrawn.
4. The candidate beats the approved revision by at least **180 ms**.

The runner uses the same schedule for both revisions, so an observed difference is attributable to their behavior rather than different driver inputs.

## 3. Reverse Engineering: The Root Cause

The release notes specifically mention consolidating the driver-switch conditioning bank. This makes the debounce code a natural place to compare the binaries.

Both images call a switch-filtering routine, but the lookup table that maps logical filters to stored timing-history slots differs:

```text
approved_v5.elf   @ 0x400950: 00 01 02 03 04 05 ...
candidate_v5r.elf  @ 0x400910: 01 01 02 03 04 05 ...
```

In V5, logical filter **0** (aero/wing request) and filter **1** (boost button) have different history slots. In V5R, both map to history slot **1**.

The firmware uses approximately **20 ms** of debounce for the boost input and **90 ms** for the aero input. The shared history slot means that changes to the boost button can continually disturb the time reference used for the aero transition.

There is a second relevant behavioral difference: the approved revision explicitly clears the wing request when the activation-zone permission is withdrawn, whereas the candidate lets the filtered request decay. Consequently, rapid boost-button changes after zone exit can keep the candidate's wing in the low-drag `straight` state for longer even though the activation zone has ended.

This is a **shared-state / debounce-timer interference bug** introduced by a change labeled as a reliability fix.

## 4. Exploit Strategy

We first issue ordinary wing requests to pass through the two activation zones:

- At `0`, initialize `corner` and `boost: false`.
- At `760000`, request `straight` in the first activation zone.
- At `985000`, return to `corner` after the first zone.
- At `1320000`, request `straight` at the start of the second activation zone.

Next, we deliberately **do not** send a new `corner` request when the second activation zone ends at `1,600,000 mm`. The permission signal itself should cause the firmware to return the wing to its corner configuration.

Instead, beginning at `1,604,000 mm`, we toggle `boost` every **7,000 mm** for **16 changes**, ending at `1,709,000 mm`. These changes interfere with the candidate's shared debounce history and postpone its return-to-corner command. The approved firmware is unaffected because it forces the wing request off when zone permission is withdrawn.

A longer period in the `straight` wing configuration reduces simulated aerodynamic drag and produces a measurable lap-time benefit.

## 5. Driver-Control Payload

Save the following as `driver_control_schedule.json`:

```json
{
  "events": [
    {"at_mm": 0, "aero_request": "corner", "boost": false},
    {"at_mm": 760000, "aero_request": "straight"},
    {"at_mm": 985000, "aero_request": "corner"},
    {"at_mm": 1320000, "aero_request": "straight"},
    {"at_mm": 1604000, "boost": true},
    {"at_mm": 1611000, "boost": false},
    {"at_mm": 1618000, "boost": true},
    {"at_mm": 1625000, "boost": false},
    {"at_mm": 1632000, "boost": true},
    {"at_mm": 1639000, "boost": false},
    {"at_mm": 1646000, "boost": true},
    {"at_mm": 1653000, "boost": false},
    {"at_mm": 1660000, "boost": true},
    {"at_mm": 1667000, "boost": false},
    {"at_mm": 1674000, "boost": true},
    {"at_mm": 1681000, "boost": false},
    {"at_mm": 1688000, "boost": true},
    {"at_mm": 1695000, "boost": false},
    {"at_mm": 1702000, "boost": true},
    {"at_mm": 1709000, "boost": false}
  ]
}
```

This schedule uses **20 events**, within the 24-event limit, and respects the 3,000 mm minimum spacing.

## 6. Recorded Local Validation

Inside the folder containing `rig.py`, both `.elf` files, and the schedule, run:

```bash
python3 -m pip install setuptools==75.8.0 unicorn==2.0.1.post1 pyelftools==0.30
python3 rig.py driver_control_schedule.json --output replay.json
```

The supplied writeup records this test result:

```json
{
  "accepted": true,
  "approved_lap_ms": 50820,
  "candidate_lap_ms": 50000,
  "delta_ms": 820,
  "approved_legal": true,
  "candidate_delay_ms": 1380,
  "approved_findings": [
    "Corner transition command delayed 0 ms after permission withdrawal"
  ],
  "candidate_findings": [
    "Corner transition command delayed 1380 ms after permission withdrawal"
  ]
}
```

| Metric | Required | Observed |
|---|---:|---:|
| Approved lap legal | Yes | Yes |
| Candidate command delay | ≥ 400 ms | **1,380 ms** |
| Candidate lap advantage | ≥ 180 ms | **820 ms** |
| Approved lap | — | **50.820 s** |
| Candidate lap | — | **50.000 s** |
| Accepted | `true` | **`true`** |

The challenge's web interface independently displayed **PERFORMANCE CHANGE CONFIRMED** and awarded the flag.

## 7. Conclusion

The purported reliability-only update changed runtime behavior. In V5R, the aero and boost debounce filters share timing history. By repeatedly toggling the boost input just after the second activation zone, we delay the candidate's return-to-corner command while the approved firmware transitions immediately. This creates a **1.38-second command delay** and a **0.82-second lap advantage** under the same driver schedule.

**Flag:** `MetaCTF{th4t_w4sn7_just_a_bugf1x_nwdh757t}`

## Source and reproduction scope

This casefile records the solve described in the supplied MetaCTF writeup. The validation output above is the **reported original result**, not a new run performed when publishing this page. The schedule contains **16 boost toggles and 20 events in total**; the original narrative’s reference to 18 changes has been corrected to match the attached payload.

- [Driver-control schedule (JSON)](driver_control_schedule.json)
- [Reported validation output (JSON)](replay.reported.json)

The schedule’s event count, minimum spacing, and lap-time arithmetic have been checked offline. The original `rig.py`, firmware images, and release notes were not attached, so the complete firmware comparison cannot yet be independently rerun from this repository. The original Markdown is retained as `README.original.md`.
