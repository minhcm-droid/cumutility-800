# ROLE & OBJECTIVE
Act as a Senior Industrial Automation Engineer & Full-Stack React/Next.js Developer. Build an interactive, real-time **DCS / SCADA P&ID Process Simulator** for **Section #800 (Utilities & Offsite Systems of an HDPE Plant)** ready for GitHub and Vercel deployment (using Next.js App Router or Vite + React, Tailwind CSS, Lucide Icons, and custom animated SVG P&ID graphics).

# UI/UX & VISUAL DESIGN REQUIREMENTS
1. **Industrial Dark Mode (Honeywell Experion / Yokogawa CENTUM DCS Style):**
   - Background: Deep slate/charcoal (`#0f172a` / `#111827`).
   - Animated Process Piping (SVG): Fluid lines must have animated flowing dashes (`stroke-dashoffset` CSS keyframes) whose speed and direction dynamically respond to pump/compressor states and valve openings.
   - Color-coded pipelines:
     - Caustic Soda (NaOH): Purple (`#9333ea`)
     - Demineralized / Treated Water (DMW/TW/PTW): Cyan/Light Blue (`#06b6d4`)
     - Nitrogen / Brine / Seal Oil: Royal Blue (`#2563eb`)
     - Steam (HS/MS/LS) & Condensate: Red (`#ef4444`) & Amber/Yellow (`#f59e0b`)
     - Flare Gas / Hydrocarbon: Orange (`#f97316`)
2. **Interactive Equipment & Faceplates:**
   - **Pumps & Blowers/Compressors:** Green = Running (with spinning impeller animation), Red = Stopped, Flashing Amber/Red = Tripped/Fault. Clicking opens a control faceplate (Start / Stop / Auto-Standby switch).
   - **Control Valves (FIC, PIC, LIC, TIC) & Manual Block/Bypass Valves:** Clicking a valve opens a DCS Faceplate allowing the operator to switch between **AUTO** and **MAN** modes, adjust Valve Opening (`MV %` from 0% to 100%), or toggle Manual Isolation / Bypass valves.
   - **Vessels & Drums:** Show real-time animated liquid levels (`0-100%`) with High/Low alarm markers.
3. **Top Alarm Banner & Side Troubleshooting Console:**
   - Flashing alarm annunciator bar showing active `H`, `HH` (Interlock), `L`, `LL` (ESD) alarms with audible/visual acknowledge button.
   - **Scenario / Fault Injection Panel:** Allows trainees to inject realistic plant upsets and practice corrective actions (Boardman & Field Operator steps).

# SYSTEM ARCHITECTURE & SIMULATION LOGIC (8 SUB-SYSTEMS OF SECTION #800)

## TAB 1: CAUSTIC SODA SYSTEM (Hệ thống xút ăn da)
- `TK-801` (Caustic Soda Receiving Tank): Level `LI-801` (Normal: 50%, Alarm H: `82.4%`, Trip HH: `93.1%` -> triggers Interlock `I-801`, Alarm L: `2.3%`).
- Dilution Line: 50% wt NaOH from Truck (`FI-803`) + DMW (`FIC-804` / `FV-804`) mixed in Static Mixer `MX-8001` (1:1 ratio -> 25% wt NaOH) into `TK-801`.
- `P-803` (Mixing Pump) & `P-801A/B` (Feed Pumps - Duty/Standby) feeding `D-753` & `M-721` (`FI-703` High alarm: `22.5 kg/h`).

## TAB 2: REACTIVATION GAS SYSTEM (Khí tái sinh sàng phân tử)
- `C-801` (Reactivation Gas Blower): Discharge pressure `PZI-815` (Alarm H: `4.0 kg/cm2g`, Interlock `I-881` on HH; PSV set at `6.0 kg/cm2g`), Bearing Temp `TI-803` (Alarm H: `80°C`), Seal Oil `PI-804` (Alarm L: `10`, LL: `9 kg/cm2g`).
- `MN2` makeup via `FIC-801` (`FV-801`).
- `E-801` (Heater, HS steam): `TIC-801` (`TV-801`, Normal: `220°C`, `3.5 kg/cm2g`; Alarm H: `250°C`) -> `D-703A/B` & `D-235A/B`.
- `E-802` (Cooler, CWS, `TI-802` Alarm H: `50°C`) -> `D-802` (Mist Separator: Normal `3 kg/cm2g`, `40°C`; `PIC-801`/`PV-801` Alarm L: `2 kg/cm2g`; `LIC-802`/`LV-802` Normal `30%` to `TK-703`).

## TAB 3: SEAL OIL SYSTEM (Hệ thống dầu làm kín)
- `D-811` (Seal Oil Drum): Normal `10 kg/cm2g`, `50°C`. Pressurized by `MN1` via `PIC-811` (`PV-811-1/2`, Alarm L: `4.5`, LL: `4.0 kg/cm2g`; PSV `12 kg/cm2g`). `LI-811` (H: `90%`, L: `7.5%`). Makeup pump `P-813`.
- `P-811A/B` (Seal Oil Pumps): `PI-812` (Normal: `12.5 kg/cm2g`, H: `14`, L: `11 kg/cm2g`).
- `E-811` (Cooler, CWR, `45°C`) -> `STR-811A/B` (Dual Switchable Filters) -> `PZI-813` (L: `11`, LL: `10 kg/cm2g` -> Interlock `I-811`) -> `SOS Header`.

## TAB 4: BRINE SYSTEM (Hệ thống nước muối - 30% wt Aqueous Methanol)
- `D-821` (Brine Drum): `-5°C` return brine, `LI-821`.
- `P-821A/B` (Brine Pumps): `PI-821` (Normal: `5 kg/cm2g`, L: `4.5`), `FI-823` (Normal: `174.25 t/h`, L: `156.83`, LL: `122` -> `I-821`).
- `PK-821` (Refrigerator Package: `C-821`, `E-804`, `E-805`, `D-805`): Chills brine to `TI-821` = `-10°C` (Alarm H: `-5°C`).

## TAB 5: WATER & NITROGEN SYSTEMS (Hệ thống Nước & Nitơ)
- Water (`7 kg/cm2g` from Package G): `TW` (`PI-833` L `4`), `PTW` (`PI-832` H `16`, L `6`), `DMW` (`PI-837` H `9.9`, L `4`).
- Nitrogen (from Package G CTU): `MN1` (`13 kg/cm2g`, `PI-861` L `10`), `MN2` (`PV-863` -> `9 kg/cm2g`, `PI-863` H `10`, L `8`, PSV `12`), `LN` (`PV-865` -> `2 kg/cm2g`, `PI-865` H `3`, L `1.5`, PSV `3.5`).

## TAB 6: STEAM & HOT WATER SYSTEMS (Hệ thống Hơi nước & Nước nóng)
- `HS` (`42 kg/cm2g`, `375°C`) -> `ZZ-841` (`TIC-857`/`TV-857` -> `254°C`, `TI-862` H `264`, L `244`).
- `MS` (`19 kg/cm2g`, `287°C`) -> `ZZ-842` (`TIC-858`/`TV-858` -> `212°C`, `TI-863` H `222`, L `202`).
- `LS` (`5 kg/cm2g`, `205°C`) -> `ZZ-843` (`TIC-859`/`TV-859` -> `159°C`, `TI-864` H `169`, L `149`).
- `D-851` (HP Condensate Drum, `LIC-851`/`LV-851`, PSV `10`), `D-852` (LP Condensate Drum, `LIC-852`/`LV-852`), `P-851A/B`, `P-853A/B` (`PIC-856` `46.8 kg/cm2g`, `I-803`), `D-853A/B` (Hot Water Drum `75°C`, `TIC-851`/`TV-851`, `P-852A/B`).

## TAB 7: PLANT AIR (PA) & INSTRUMENT AIR (IA) SYSTEMS
- `PA`: `9 kg/cm2g` -> `D-872` (PSV `10`) -> `7 kg/cm2g` (`M-302`, `D-874`).
- `IA`: `8 kg/cm2g` (`PZI-873`) -> `D-871` (PSV `10`) -> `7 kg/cm2g` (`D-873`). If `PZI-873 <= 4.2 kg/cm2g` (`LL`), trigger **Interlock `I-001` (EMERGENCY SHUT DOWN - IA FAILURE)**.

## TAB 8: FLARE & HEXANE RECOVERY SYSTEM
- `D-882` (Suction Drum, `100-150 mmAq`, `40°C`, `PIC-881`, `PZA-886` LL `20 mmAq`, `LZI-882` HH `78.8%` -> `I-881`).
- `C-881A/B` (Flare Gas Compressors), `E-881` (Aftercooler), `E-882` (Brine Cooler, `0°C`, `LIC-883`/`LV-883`), `PIC-882` (`3 kg/cm2g`), `D-881` (KO Drum, `LZI-881` H `73.3%` -> `I-001`), `P-881`.
