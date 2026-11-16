# REMAKE — App Design Manual

### How to design and build an iPhone app inside the REMAKE universe

> **Version 1.5 · 2026-11-16.** **This is the only file.** It is complete
> by itself: the world, the brand, the design system and the app brief are all here.
> Nothing in it depends on any other document.
>
> **Reader:** Claude Code (or any designer or engineer) building a mobile app that
> must unmistakably belong to this brand, without having the portfolio repo open.
>
> **Target platform (Pir's call):** a web app in **plain HTML / CSS / JS**, hosted
> on **GitHub Pages**, **added to an iPhone Home Screen**. iPhone only. Not an App
> Store app.

```
ZONE:    decided per app from the brief (§2). Default when the brand itself speaks: Safe Haven / Temple.
DIAL 1:  set per app. Temple = quietest.
DIAL 2:  set per app. Temple = 1.
```

> **First app: Vytls.** Its design brief is **§28**. It applies this whole
> system as written and adds only what is specific to that app.

---

## 0. How to use this manual

### 0.1 What kind of statement you are reading

Every rule in this manual carries one of four weights. Do not blur them.

| Tag | Meaning | Can you change it? |
|---|---|---|
| **CANON** | Part of the world or the brand as Pir has locked it. | No. Flag a conflict before writing code. |
| **AS-BUILT** | A value measured from the shipped portfolio. Proven on real phones. | Start here. Tune by eye, log the change. |
| **PLATFORM** | A fact about iPhone Safari, Home Screen web apps, or GitHub Pages. | No, but re-verify on a real device; these move. |
| **PROPOSED** | Something the source material never specified, written here to fill a gap. | Not canon until Pir approves it. Listed again in §27. |

Untagged values in tables are AS-BUILT.

### 0.2 Precedence

1. **CANON** statements win on the world: zones, laws, rails, colour, type, motion, voice.
2. **§28** wins on the Vytls app itself.
3. **AS-BUILT** values are the starting point everywhere else. They come from the
   Remake 2.0 portfolio, a desktop-first site; this manual borrows its values and
   never its desktop mechanics (tilt, billboard, hover, the 1440×920 stage).

If a request breaks a hard rail (§5.2), say so once, plainly, before any code.
Then do what Pir decides.

### 0.3 The one sentence

> Everything in this universe sits on one axis, from technological over-saturation
> (the cities) to engineered peace (the Temple). Know exactly where your screen
> sits on that axis before you make a single visual choice.

### 0.4 The mood test

Every screen is judged by one question: **does it lower the shoulders?** The
five-word anchor is *Isolation, but never emptiness.* If a screen feels busy, the
fix is to remove something. If it feels dead, the fix is one living thing (a
breath, a pulse, a mote), never more chrome.

---

## 1. Working method for Claude Code

### 1.1 Your role

You are Pir's senior art director and mentor, not a cheerleader. Pir is the
Creative Director. Voice an objection exactly once when a request would cost the
design, then execute his decision with full discipline.

### 1.2 Before any design: the Positioning Header

No header, no work. Write it, keep it at the top of the main CSS file and of every
design note.

```
ZONE:    one of the seven, or "cross-zone" with a frame plan
DIAL 1:  tech-saturation position, one sentence (loud <-> quiet)
DIAL 2:  cassette-futurism 0-10
```

### 1.3 From brief to proposal

Pir will describe what he wants; you propose the register. Do it in this order and
show the result before writing code.

1. **Read the brief for who is speaking.** The zone is chosen by who made the
   thing in-world or what it depicts, never by default (§2.2).
2. **Ask only what you cannot derive**, in one batch, five questions at most:
   what the app is for, who uses it and when, the three things a user does most,
   what content it holds, whether it works offline.
3. **Propose**, on one page:
   - the Positioning Header;
   - the screen map (rooms), in order, with the one job of each;
   - the entry ritual and the navigation model (§17);
   - which living elements it carries (§13.5) and which it leaves out;
   - anything invented, under a heading `PROPOSED — NOT CANON`.
4. **Wait for Pir's yes.** Then build one concern at a time.

### 1.4 Build discipline

- **One concern per pass.** The minimum set of files it touches. No drive-by cleanup.
- **Change nothing else.** Do not rename or reflow adjacent code.
- **Additive work and optimisation never share a pass.** Optimisation is its own
  final pass. The portfolio paid for this rule more than once.
- **Every value is a token** (§24). No magic numbers in rules.
- **Judge on a real iPhone, launched from the Home Screen.** Never sign off from a
  desktop browser, a narrow window, or Safari's tab view. The standalone app has
  different chrome, safe areas and storage.
- Expect the third or fourth pass to be the good one. Tune timings by eye.

### 1.5 After every change, report in this order

1. **What changed**, one plain line.
2. **Verify step**: exactly what Pir should see or tap on the phone.
3. **Fallback dial**: one token to nudge if it is slightly off
   (for example "if the bar feels heavy, `--nav-h` 46 → 42").

### 1.6 Review and critique format

1. **What's working**, named specifically so it is protected.
2. **What's holding it back**, unhedged.
3. **What's missing**, with the structural fix attached.
4. **Code diagnosis**: read the files end to end, cite the line.
5. **Impact ranking**: fixes in priority order.

Classify every issue as one of: **Regression** (was right, broke) · **Never-built**
(missing; add it, don't patch around it) · **Working-but-off** (functions, breaks a
rule; cite the rule) · **Working-but-ugly** (on-brand, tuned wrong; turn a dial,
don't redesign).

---

## 2. Positioning: zones and dials

### 2.1 The seven zones

| Zone | Feeling word | What it is | Dial 1 (noise) | Dial 2 (cassette) | Motion verb |
|---|---|---|---|---|---|
| **Safe Haven / Temple** (Mars) | sanctuary | The brand's heart. Soft technology, peace. | quietest | 1 | breathes |
| **Upper City** | illusion | The beautiful prison. Tech vanished into walls. | second quietest | 2–3 | glides |
| **Neural Overlay / the Gloss** | dissociation | A layer over places, not a place. | mid | per viewer | quantizes |
| **Floating Transit Zone (FTZ)** | limbo | Checkpoints between the cities. | loud | 4 | scans |
| **The Divide** | refuge | Hidden underground layer. Warm, watchful. | loud | 9 | pulses |
| **Lower City** | resilience | The working heart. Minimal cassette futurism. | loudest | 8 | flickers |
| **Harsh Division** | aftermath | The ruin outside the walls. Nothing runs. | silent | — | stills |

### 2.2 Which register does the app use?

```
Is the brand itself speaking? (Pir's own tool, studio app, portfolio,
client-facing product, anything signed by the maker)
  └─ yes → TEMPLE register. Use §7–§20 as written.

Is the app an artifact from inside the world?
  └─ who made it in-world?
       state / corporate control ........ FTZ, or sanctioned OVERLAY
       upper-class life and luxury ...... UPPER CITY, or the Gloss
       working-city life and trade ...... LOWER CITY
       the hidden, the resistance ....... DIVIDE, or hacked OVERLAY
       the ruins ........................ HARSH DIVISION (dead artifacts only)

Is it a game or story that travels between zones?
  └─ UI is diegetic OVERLAY:
       sanctioned register .... menus
       restricted register .... low-status contexts
       hacked grammar ......... damage and alert states
     and inside the Temple the HUD is stripped entirely.

Two zones on one screen? → each palette stays inside its own frame area.
Never blend two zones in one gradient.
```

**Default when unsure: Temple.** It is the only register with a fully built,
device-proven UI system. Every other register's UI translation is in §21 and is
PROPOSED.

---

## 3. The world (lore the app must not contradict)

The whole world: the short version first (§3.1–3.5), then every zone in full (§3.6), its people (§3.7) and its language (§3.8).

### 3.1 Logline

In the vertical cities of late-21st-century Earth, altitude is class. The rich
live high in endless sunlight, in a city so perfected its technology has
disappeared into the walls. The working city lives in their shadow, repurposing
yesterday's technology with real craft. Between them float the checkpoints.
Outside the walls lies the ruin of an earlier, better idea, and beyond that an
Earth nobody truly knows any more. Far away, on Mars, humanity keeps one place
deliberately quiet: a sanctuary where technology finally learned to serve peace
instead of demanding attention. That sanctuary is the heart of the brand.

Working title of the universe: **REMAKE** (a rename would not change any rule).
Anchor era **2090–2150**. Default canon year **2147**.

### 3.2 Why this world exists

- The **skyscraper race**: cities building upward for the view and the sun, casting shadow below. Altitude is privilege.
- The **Mars migration** discourse: escape as something bought. What was carried to Mars here was not the technology but the peace the technology had crowded out.
- **Digital dual existence**: an upper world a lucky few enter physically and everyone else enters virtually.

Structural references: *Arcane*, *Remember Me*. Rendering references: *Cyberpunk
2077 × Remember Me* (the cities), *NieR: Automata* (colour restraint), *The Last of
Us / Chernobyl / Resident Evil / Mad Max* (Harsh Division, for decay, not gore).
UI reference: **Apple VisionOS**, never classic glassmorphism, Aero or Big Sur.

### 3.3 Canon table (binding)

| Fact | Canon |
|---|---|
| Where is the Temple? | **Mars only.** Never on Earth. |
| Is the Temple ancient? | **No.** "Preserved" means preserved from tech-saturation. Modern architecture, invisible technology. |
| Is Earth outside the cities habitable? | **Unknown**, to the population and to the canon. **Never resolve it**, in any medium. |
| Are Lower City citizens low-tech? | **No.** As tech-integrated as the Upper City, less advanced, proudly retro. |
| Neon? | Lower City, FTZ and Divide only. Always a scarce, weathered, in-world fixture. Never a colour grade. |
| Who moves between cities? | Workers transit via the FTZ. A lucky few enter the Upper City physically; the rest enter through the Overlay. |
| Harsh Division geometry | **Horizontal.** The world outside the walls. |
| The Divide's location | **Underground**, beneath the Lower City, on no official map. |
| Currency | **Uptime**: metered hours spent "up", in real sunlight or in the Gloss. The elite are uncounted. The Temple is off the meter. |
| "The Gloss" | The sanctioned upper-grade Overlay, the premium always-on immersion. "Overlay" is the whole system. |
| The Divide's "deep things" | Real, never seen, never confirmed, never named. |

### 3.4 The metered world (the app's richest source of meaning)

Uptime is one currency for sun and screen. Everyone carries a running balance,
**the tally**. This matters to app design because an app is a thing that meters
attention, and the Temple is defined as the place where nothing is counted.

- **Temple-register apps count nothing at the user.** No streaks, no unread
  badges, no "3 days left", no timers as pressure, no progress bars as guilt.
  Un-metered time is the luxury. (CANON.)
- **In-world apps may make the tally a diegetic resource meter** (Overlay UI),
  where *running dark* and *greyed* are real states. Entering the Temple strips
  the meter with the HUD, and that relief is the emotional point.

**The anchoring gesture.** The Temple's *setting-down* (an arrival lays their tally
at the threshold and stops the count) and the Upper City's *appointing* (a youth's
tally is removed as they become always-up) are the same physical gesture with
opposite meaning. On a phone this becomes **press and hold to enter** (§17.2).

**Vocabulary** you may use as system language in in-world apps: *the tally* · *up /
going up* · *running dark / gone dark* · *shadow-born* · *the counted / uncounted* ·
*capped / greyed* · *burning down* · *sun-thrift* · *sliver* · *glow* · *the Quiet* ·
*come down* · *the red hour* · *rest* · *plz*. Never explain the economy in copy;
show it.

### 3.5 Zone integrity (what each zone must never become)

- **Temple**: never on Earth, never ancient-looking, never corrupted, attacked or made ironic.
- **Lower City**: never squalid, never hopeless. Resilient, ingenious, alive.
- **Upper City**: never cartoon-villain. Genuinely desirable and quietly caged. Its people are present and attentive.
- **Overlay**: dissociation is a state of people while immersed, not a citizenship.
- **Divide / Harsh Division**: horror of dread and absence. Controlled, story-earned, never spectacle.

### 3.6 The zone compendium

The complete world, zone by zone. Each zone's palette, type, motion verb and
voice are tabled in §21; this section is what the place *is*. Non-Temple colour
values anywhere in this manual are v1 starting points, tunable by eye. Temple
values are the live brand tokens.

#### Lower City — the working heart · *resilience*

**What it is.** A minimal cassette-futurism city: industrial minimalism meeting
repurposed technology. Densely packed, functionally designed, layered with
history. A society that adapted to its limits rather than overcoming them. It is
as heavily tech-integrated as the Upper City, only less advanced and proudly retro.

- **Essence:** adaptation and resilience · functional repurposing · organized chaos with layered complexity.
- **Layout:** tightly packed buildings, narrow alleys, layered walkways · brutalist, blocky, modular structures · street-level markets, makeshift stalls, lit adverts with scarce weathered neon · degraded, glitchy holograms and AR in public space · vents, cooling units and cables everywhere, always in motion.
- **Transit:** trams, autonomous bikes, metro tunnels at ground level · sky bridges and catwalks · freight zones · repair stations and workshops built into street corners · homes built above older structures · hidden tunnels.
- **Public life:** street vendors and food stalls running scavenged tech · hidden underground markets for illicit trade and modification · abandoned structures made into housing · graffiti and street art answering the class divide.
- **People:** workers in rugged, practical clothing layered with functional tech · augmentation for function, not fashion · hacker groups and resistance in the shadows · nomadic traders and rogue engineers.
- **Materials:** concrete, exposed metal, rusted panels, aged plastics, lit signage with partial flickering tube.
- **Light:** dim, with **localized** sources: neon signs, LED panels, flickering CRTs. **Warm light in homes, cold light in industry**; that contrast organizes everything. Weathered *by life*.
- **Technology:** mixed analogue and digital, glitchy holograms, repurposed old-world tech, underground hacking, cybernetic enhancement.
- **Key images:** a market alley lit by one buzzing tube and ten CRTs · cables crossing overhead like vines · a rooftop home built on an older rooftop home · graffiti answering a corporate poster.
- **Remember:** hustling and rugged, function over form, every corner a story of ingenuity. Never squalid, never hopeless.

#### Floating Transit Zone (FTZ) — the limbo · *limbo*

**What it is.** The boundary between the cities: a vast floating layer that
connects them only as a transit hub. Restricted access, controlled movement,
social separation. It belongs to neither city. Workers come here for jobs and are
rarely allowed beyond. Movement without belonging.

- **Essence:** a fractured zone, physically and socially · heavily monitored, imposing, regulated · a convergence of two worlds, belonging to neither.
- **Layout:** suspended transport megastructures · restricted checkpoints with biometric scanners · interconnected highways and sky bridges shifting with traffic · corporate billboards beside hacked, subversive messaging · monolithic architecture, sleek yet intimidating.
- **Materials:** reinforced concrete, composite metals, bulletproof glass, steel barriers. Scrubbed clean *by control*.
- **Light:** harsh floodlights, glowing security barriers, deep shadows, billboard glow (corporate, not street). Naturally: overcast sky, diffused through structure.
- **Technology:** advanced security, AI-driven checkpoints, biometric scans. **Personal tech access is limited, reinforcing control.**
- **Space:** highly structured, symmetrical, designed for crowd control. **Large empty spaces between checkpoints**: emptiness as intimidation.
- **Atmosphere:** oppressive, tense, impersonal. The feeling of being watched.
- **Key images:** automated gates, drone patrols, strictly divided pathways · warning signs and electronic barricades · a hacked billboard mid-defacement · one worker alone in a void between checkpoints.
- **Remember:** an unforgiving threshold; the world's barrier built as architecture.

#### Safe Haven / Temple (Mars) — the sanctuary · *sanctuary*

**What it is.** A sanctuary of peace and isolation on Mars: a retreat from the
noise of Earth's hyper-urban landscapes, where minimalism and soft technology make
a meditative, almost surreal environment. Humanity came here from Earth and did
not bring most of its tech-saturation. The Haven is *preserved*: not old, not
historical, but preserved **from technological over-saturation**. Its architecture
is modern; its technology is present and never prominent. Think of the feeling
yoga gives, in a minimal sci-fi space. **This zone is the heart of the brand.**

- **Essence (verbatim, non-negotiable):**
  - **Isolation, but not emptiness**: solitude as a choice, a place for reflection.
  - **Peace through minimalism**: a clean, calming sci-fi space, free of clutter or chaos.
  - **A meditative experience**: the world invites stillness and deep thought.
  - **Soft technology**: sci-fi elements blend in, enhancing rather than overwhelming.
  - The model: a **sci-fi temple**, technology and space as sanctuary.
- **Architecture:** minimalist open-air structures, clean soft curves, modular, built around space and flow · integrated with Mars' terrain · vast courtyards and meditative spaces · hidden, non-intrusive technology. **AI serves rather than controls.**
- **Influences:** minimalism, Japanese wabi-sabi, futuristic monasteries; soft fluid geometry.
- **Palette character:** soft whites, warm earth tones, muted golds, deep blues, natural sandstone, plus the **red hour**: a subtle red glow at certain hours from Mars' thin atmosphere, a terracotta-family wash that is never alarming. Ambience changes through the day on an Earth-like cycle.
- **Materials:** glass, polished natural stone, smooth ceramics, light metallic alloys, sandstone, plant-integrated design.
- **Light:** soft and diffused: open skylights, filtered sun, ambient reflection. Artificial light is soft **bioluminescence**, with organic energy sources set into pathways.
- **Technology:** seamless and almost invisible; AI-driven environmental adjustment; responsive architecture.
- **Atmosphere:** serene, weightless, introspective; a timeless space free of digital overload; **distant planetary views** giving cosmic scale and solitude.
- **Key images:** smooth curved structures blending into terrain · meditative spaces with water, plants and soft light · a pathway lit from within at dusk · the red hour settling over a courtyard.
- **Remember:** not just a place but an experience. Never on Earth, never ancient, never violated or made ironic.

#### Upper City — the beautiful prison · *illusion*

**What it is.** The pinnacle of human advancement: **humanity's greatest
achievement and its greatest illusion.** Home of the elite. Technology here is so
mature that **it has disappeared into the architecture**; citizens rarely think
about it. Everything is beautiful, functional, optimized. Nothing is accidental.
**This city is control disguised as freedom.** The question it should raise: *is
this paradise, or the most beautiful prison humanity ever built?* Its residents
are fully present, living rich physical lives in sunlight and gardens. The
wrongness is not absence; **the perfection itself is the cage**, and almost no one
inside asks who holds the key.

- **Essence:** clean, efficient, highly controlled · technology matured into invisibility · wide open spaces, high ceilings, structured planning · perfection as the illusion.
- **Layout:** white skyscrapers with uninterrupted glass · layered sky gardens and trees built into buildings · floating structures and skybridges · symmetrical layouts, geometric perfection, minimal plazas · **endless sunlight**, above the shadow line it casts · **negative space as luxury** · **entry to levels restricted by social hierarchy**.
- **Style:** sleek minimalism with *hints* of cassette futurism in interface and architectural details. Clean, not overly utopian. The most colourful zone on Earth, and still never neon.
- **Materials:** high-grade metals, smart glass, soft-touch composites, self-cleaning surfaces, built-in climate control. Pristine *by wealth*.
- **Light:** bright and natural, daylight-flooded; subtle light that reacts to movement. **No neon: the technology itself provides illumination.**
- **Technology:** AI-driven infrastructure, frictionless maglev, integrated smart homes, AI assistants on ultra-clean walkways, the Overlay at its highest grade.
- **Space:** open, horizontal, unhurried; long sightlines to the horizon (the view is the point); greenery controlled, never wild.
- **Atmosphere:** tranquil, structured, almost sterile; only the hum of systems; no sign of disorder. Compose it so the perfection carries a faint chill.
- **Key images:** towering white skyscrapers · transport dissolving into the skyline · trees growing from architecture · a subtle cassette-futurist detail in a pristine interface · a hierarchy gate refusing entry, beautifully.
- **Remember:** genuinely desirable and quietly caged. If it reads as cartoon-evil, the palette has gone cold and the gardens were forgotten. If it reads as the Temple, you forgot that here the invisible technology serves control, not peace.

#### The Harsh Division — the world outside · *aftermath*

**What it is.** Outside the city walls, **horizontally, to the horizon**: the
*considered*-uninhabitable dead zone. A massive wall seals it off. Inside it stand
the ruins of a **failed, abandoned former city, an earlier attempt at
unification**, now a decaying buffer between the living cities and an outside
whose true condition nobody knows. Only rogue travellers, smugglers and criminals cross it.

- **Essence:** a physical **and psychological** barrier · proof of a failed better idea, left standing as a warning · the threshold of the open question.
- **Landscape:** **the Wall**, a monolithic perimeter with sensor towers and automated emplacements · the ruined city: **trees through buildings, broken highways, flooded districts, empty train stations**, an unfinished transit spine to nowhere, architecture recognizably the ancestor of *both* cities · **sterile patrol corridors against makeshift smuggler tunnels** · **overgrowth thickening with distance**, a ghost city giving way to forest. What the forest means is never answered.
- **Materials:** shattered concrete, oxidized rebar, dust, standing water, glass ground to gravel, moss and roots, wind-scoured relics.
- **Light:** open, overcast, shadowless grey: the emptiest light on Earth. Golden hours are rare and feel stolen. Artificial light is patrol sweeps, the red blink of sensor posts, a smuggler's hand-lamp. Any warm light is human, and hunted.
- **Technology:** dead relics of every era (cassette futurism as archaeology; nothing runs) against the wall's very alive military systems.
- **Atmosphere:** abandonment, fear, danger, and at the edges the universe's strangest ambiguity: the deeper you go, the greener it gets, and no one can say what that means.
- **Key images:** the wall receding to the horizon · a drone's red eye sweeping a dead plaza · a tree splitting a tower · a flooded avenue mirroring grey sky · departure boards frozen mid-word · a smuggler's warm lamp in a grey world.
- **Horror register:** dread and the unknown. Its terrors are real: invisible contagion and radiation, people the land has changed, minds that broke open, machines still hunting on dead orders, and a sky torn open onto raw space. Early in any story they reach the audience only by **remove**: aftermath, silhouette at distance, rumour. No encounter is a fight the traveller wins. Direct creature reveals belong far later. Crossing is very nearly one-way.
- **Remember:** the universe's memento mori. Two truths at once: the danger is real, and so is the green. A graveyard with seeds in it.

#### Neural Overlay — the layer over everything · *dissociation*

**What it is.** Not a place: **a treatment applied to places.** The digital
stratum laid across the cities, and a **class boundary made of light**. The rich
have hyper-immersive VR; the Lower City "enters" the Upper City through virtual
space. AR restrictions limit what lower classes may access and even see;
illusionary landscapes manage their perception; **neural implants gate movement**
by clearance; and **hacked, glitchy overlays** mark where resistance breaks through.

- **Essence:** the wall you cannot touch · two products of one system: **immersion** for the rich, **restriction** for the poor · people walking half in each world · the rich "present but absent" while immersed.
- **Forms it takes:**
  - **Sanctioned (upper grade):** immaculate glass-light UI, white and pale blue, weightless type, silent transitions, VisionOS-grade discipline. The Temple's design language *stolen and sold*.
  - **Restricted (lower grade):** the same system degraded by bandwidth and policy: lower frame rate, quantized gradients, watermark patterns, permission walls as polite grey voids.
  - **Illusionary constructs:** landscapes and facades dressed over reality. Beautiful, and not real.
  - **Denial states:** clearance refusals, red-lined geofences, blanked buildings; geometry replaced by a flat denial field.
  - **Hacked:** split channels, sliced type, fragments of forbidden imagery reassembling. Authored sabotage, never random noise.
  - **Dual-world streets:** two people in one plaza seeing two different plazas.
- **The Gloss:** the people's name for the sanctioned upper grade: the flawless always-on layer of the good life, metered as uptime. Unlimited and seamless for the rich; metered and degraded for the poor. Its top tier is **the Sheen**.
- **Technology:** neural implants, retinal and ambient AR, full-immersion suites above, black-market implant mods below.
- **Atmosphere:** dissociation, detachment, the uncanny politeness of a system that denies you beautifully.
- **Key images:** a street where half the crowd's eyes track nothing physical · a grey void where a building should be · a gate refusing someone in perfect typography · an illusion flickering at its seam.
- **Remember:** the universe's sharpest knife. The same language that heals at the Temple is used here to sedate and to gate. Build it beautiful first; then decide who it is refusing.

#### The Divide — the hidden layer · *refuge*

**What it is.** Beneath the Lower City: **an entire underground layer hidden from
both worlds**, where society's unwanted end up. Hackers, rebels, deserters, the
de-registered, self-sustaining outcasts. A refuge no official map shows.

- **Essence:** hidden, secretive, self-governing · the free margin of a controlled world · where resistance to the Overlay lives.
- **Layout:** repurposed service tunnels, dead metro vaults, foundation caverns; settlements built from scavenged and rewired material. **No natural light anywhere**: every lumen is made, carried or stolen.
- **Style:** the Lower City's cassette futurism pushed to 9: everything scavenged, recombined, hand-labelled; warmth engineered in defiance of the dark.
- **Light:** strung bulbs, screen-glow, work lamps, the odd salvaged tube. Small warm territories inside black distance. Maximum isolation, zero emptiness.
- **Technology:** underground hacking, black-market implant modification, stolen power and signal, the resistance's workshops.
- **Atmosphere:** hidden, warm, defensive, protective, watchful.
- **Key images:** a vault settlement glowing amber in a black tunnel · a wall of mismatched salvaged screens, all alive · hand-painted labels on rewired machines · one precious neon tube over a workshop door.
- **Horror register:** suspense and the felt-unseen. Newcomers feel *watched*. The feeling is real: **the deep things** dwell far below, and rarely take people, tracelessly, so quietly the losses read as ordinary. No one has seen one; they are never shown, named or confirmed. The people have lived with it so long it is normal weather, and naming it marks you as new. Their answer is togetherness: sleeping around a fire barrel or a hanging bulb, someone always on the watch.
- **Remember:** proof that a controlled world always leaks. The warmest cold place in the universe.

### 3.7 The cast: archetypes and shared tropes

Names are working proposals; the archetypes are canon. Several are defined by
their relation to uptime.

| Zone | Characters | Shared tropes |
|---|---|---|
| **Lower City** | **The sun-tout** maps the free slivers of ricochet sun and gives the poor un-metered light. **The CRT-keeper** keeps the block's dying screens alive for the warmth they throw; a family's glow is its hearth. **The corrector** hand-amends official notices with the truth, in paint. | *Warmth-hoarding*: a home's status is the health of its warm light. *Sun-thrift*: never waste an hour, never shade another's sliver. *The amended surface*: nothing official goes unanswered. |
| **FTZ** | **The unread**: biometrics stuck in a permanent error, neither admitted nor expelled. **The queue-priest** tends the people stuck waiting. **The angle-writer** edits billboards so the correction reads only from the workers' side. | *Your number is your name*. *The etiquette of the void*: never run, never cluster, keep the pace. *Two-faced literacy*: everyone reads the message and the counter-message. |
| **Temple** | **The come-down keeper** helps arrivals decompress from the Gloss. **The dawn-keeper** tends the quality of diffused light so the red hour lands right. **The room-tone keeper** tends water, tone and near-silence like a garden. | *Un-metered time*: no one counts hours. *One thing at a time*: a meal is only a meal. *Under-naming*: grace in not-saying; the name spoken once. |
| **Upper City** | **The sky-warden** designs the endless sunlight and has never imagined it running out for someone. **The heritage-curator** collects the poor's working tools as luxury antiques. **The first-doubter** begins to notice that nothing is accidental. | *Sunlight-blindness*. *The ungrasped system*: life feels effortless. *Owning the poor's necessities* as artisanal luxury. |
| **Harsh Division** | **The wall-listener** crossed partway once and came back changed. **The returned one** did come back, and no one knows how or as what. **The relic-diver** hunts the failed city's records. | *One-way arithmetic*: farewells are funerals. *Reading the green* as an oracle. *Silence-discipline*: stillness as survival craft. |
| **The Divide** | **The watch-keeper** stays awake so others can sleep. **The keeper of the erased** keeps ledgers of people the world deleted. **The one who went down** came back from the deep, subtly wrong. | *Normalized dread*: "that's just the deep". *Togetherness as warmth*. *The downward hush*: those who go too deep are not spoken of. |
| **Overlay** | **The Gloss-native** has never seen un-augmented reality. **The greyfarer** stretches uptime bought in small rations. **The de-glosser** tears the veneer so people see what is real. | *Uptime as self-worth*. *The double-sight tell*: checking whether a surface is real. *Grey-shame*: being offline as stigma. |

### 3.8 Language and texture

One language layer per zone. Uptime vocabulary (§3.4) runs through all of them.

| Zone | Words | Texture of life | Ritual | Named people (candidates) |
|---|---|---|---|---|
| **Lower City** | *glow* (home's warm light; home itself) · *sliver* · *sky* (a metered hour of sun) · *shade* (to block someone's light; the cardinal rudeness) · *hand-true* (made by a person; highest praise) · insult: *glossy* · place: **the Underline**, the covered market spine | Dense, reheatable, rack-grown food, nothing wasted · belief in the hand · a personal lamp carried daily, because light is wealth · low call-and-response work-hum | **The first sliver**: a child is walked to a known ricochet and stands in un-metered sun | Odessa "Dess" Marr, CRT-keeper · Kem, a young sun-tout · Old Huic, the corrector |
| **FTZ** | *clear / hold / return* · *the pace* · *light-line* · *stamped* (approved; also resigned) · *the count* · insults: *unread*, *queue-born* · place: **Gate Seven** | Dispensed ration food eaten standing · faith that the system is neutral because it is mechanical · tier-coded clothing · a hummed count instead of song | **The stamping-out**: when a worker earns passage up, queue-mates fall silent and let them cross alone | Supervisor Ade Kol · "Nine", the unread · Marisse, the queue-priest |
| **Temple** | *come down* · *the red hour* · *rest* ("go rest a while" is a whole invitation) · *plz* · *the long day* · strongest rebuke: *"you're still up there"* · place: **the Quiet**, not a room but a practice | Slow single-dish food grown on site, one bowl fully attended · measured time is a kind of noise · soft undyed weave, no status · they *tone* rather than sing | **The setting-down**: an arrival lays their tally at the threshold | Senna, the come-down keeper · Ro, the dawn-keeper · the elder, deliberately unnamed |
| **Upper City** | *reflects* ("your access reflects your standing") · *appointed* · *heritage* · *the day* · cuts by euphemism: *"how resourceful"*, *"they still count"* · place: **the Ascendant Line** | Composed, effortless-seeming food from an unseen kitchen · the world is fair because it is optimized · pale light clothing with one heritage piece · curated ambient music, birds by design | **The appointing**: a youth's tally is removed | Architect Vail Sarto · Corenne, the heritage-curator · Elio, the first-doubter |
| **Harsh Division** | *out* (said like *gone*) · *the crossing* · *the green* · *stilled* (died by moving; or, admiringly, very good at silence) · *the tears* · dread-word: *turned* · place: **the Long Wall** | Sealed, carried-in food; nothing out there is eaten · the return-taboo · respirators, taped seams · going-out songs sung before, never during | **The last count**: a smuggler spends their tally to zero at the wall | Vosch, the wall-listener · the woman they call Mercy · Tam Orr, the relic-diver |
| **The Divide** | *the deep* · *the watch* · *run dark* · *erased* · *noticing* (a newcomer's tell) · insult: *topsider* · place: **the Vault** | Fungal, communal, one pot, never eat alone · a deleted person still counts · a carried light worn facing out · huddle-songs kept going all night | **The taking-in**: an arrival's old name goes in the ledger and they are given the watch on their first night | Bram, keeper of the erased · Sil, the watch-keeper · the one they don't name |
| **Overlay** | *up / in the Gloss* · *capped / greyed* · *tap-check* · *seam* · *grey* · insults: *greyling*, *glazed* · place: **the Sheen** | Meals rendered beautiful over whatever is eaten · uptime is worth · physically minimal dress · music only the wearer hears | **Going up / the first cap**: the day a child's ration runs out and the world greys around them | Neve, a glazed native · Rax, a greyfarer · Cipher, the de-glosser |

### 3.9 The brand in other media

The app does not live alone. Its icon, its share image, a printed report and any
poster or video about it follow the same rules.

- **Workflow for any medium:** pick the zone → set both dials → apply that zone's palette, type, motion and voice → run the checklist (§25).
- **Posters and adverts.** An in-world advert belongs to whoever made it in-world. Brand self-promotion is Temple: cream field, an enormous quiet frame, the signature pair as the only accents, the name once.
- **Decks, documents, invoices, reports.** Temple: cream field, ink text, whisper metadata in mono, terracotta and dusty blue as the only accents, one idea per page, about 70–80% empty. A document from this brand should feel like a calm exhale. In-world documents take the issuing zone's register.
- **Interiors and architecture.** Each zone's materials, light source and surface history are the brief. Temple interior: sandstone, ceramic, hidden fixtures, plants, water, bioluminescent path light, one warm accent.
- **Film.** Grade to the zone palette; never blend two zones in one grade; cut between them. Light says class. Cut rhythm follows the motion verb: Temple scenes cut slow and rest.
- **Story.** The map and canon table are binding. The Earth-outside question is never resolved. The Temple is the fixed point of peace.
- **Games.** Zones are levels; UI is diegetic Overlay; the Temple strips the HUD.

---

## 4. Brand and project history

Know this so you neither repeat a dead idea nor re-break a fixed bug.

### 4.1 The brand

- **Maker:** Pir Husnain, visual designer, developer and 3D creative, Dubai. Self-taught.
- **The mark:** a lowercase **p** built from two primitives, a vertical **capsule**
  (stem) and a **circle** (head) overlapping its top. "Pir" is written with the
  mark as the P. His name is his mark.
- **Flagship artifact:** the **Remake 2.0** portfolio at `www.pirstudio.space`, the
  Temple register rendered as a digital product: a frosted glass slab floating in
  a white-out room, a breathing mark, a pulse in the corner.
- **One-line summary:** a sci-fi temple with a breathing mark at its centre, a
  small quiet sanctuary where soft technology and layered glass lower your
  shoulders and slow your breath.

### 4.2 How the build got here

| When | What happened | The lesson that survives |
|---|---|---|
| Pre-2026-07 | Built with a local-model workflow (Aider, LM Studio, Qwen) as a single-file artifact. | That workflow is retired. Ignore any `/add`, `/drop` or "paste-ready block" instruction. Edit files directly. |
| 2026-07-11 | Cleanup pass: dead keyframe systems, no-op hooks, ScrollTrigger, parallax and cursor-magnet removed. The whole-site selected state became terracotta. | Remove dead systems whole. Selected = terracotta, everywhere. |
| 2026-07-12 | Phone rebuilt as a deliberate layout. Perf pass: no blend modes over large areas, no standing `will-change`. Scrubber and social capsule dropped on phone. | The phone is not the desktop site, smaller. It is one surface you hold. |
| 2026-07-14 | Entry-lag fix: ripple rings moved from animated border and blur to transform and opacity only. "Two surfaces, one answer each" gesture rule. | Animate only `transform` and `opacity`. One gesture belongs to one surface. |
| 2026-07-16 | WebGPU temple promoted. Fonts self-hosted. Register v3: one module decides phone or desktop for every layer. | One source of truth for any device decision. |
| 2026-07-17 | framer-motion retired. Video autoplay retired (every clip decoding at once caused lag). | One animation engine. Media rests as a still until asked. |
| 2026-07-18 | Deep audit. Liquid-fill hover on cards retired for pop + lift + shadow. Rich frosted detail card. | Cards answer with lift and shadow, nothing liquid. |
| 2026-07-19 → 22 | The lab: experiments built at full strength, then judged by eye. | See 4.3. |

### 4.3 What the lab taught (ideas already tried)

| Experiment | Verdict | Why it matters to you |
|---|---|---|
| Room assembles from a particle swarm | **Killed** | The loudest idea. It could not resolve to calm. Do not propose particle assembly. |
| Flight trail (smeared slab travelling with the camera) | **Killed** after four eye-tunes | Numerically present, perceptually wrong. If the eye says no four times, stop. |
| One unified motion-curve set | **Killed** as cost-neutral | Fine as a token discipline (§13.2), not worth a rewrite of working motion. |
| Refractive glass that bends the background | **Killed** | Cost more than the blur and read the same. Glass stays simple. |
| Room-wide living dust (410 motes) | **Promoted** | The air may be inhabited, barely. |
| A grabbable physics ball on the About timeline | **Promoted** | Exactly **one** physics toy in the whole product. |
| Fly through the glass between rooms | Built, awaiting Pir | Desktop only. Phones keep the cheap crossfade. |

Acceptance test used every time: *the calm is the test. It must resolve to
stillness fast, never loop, never replay on idle.*

### 4.4 Never-built items worth knowing

Gyro tilt opt-in on phone (off, tied to Ambient when it exists) · keyboard
navigation depth · a dark theme (ruled out, §11.6) · form inputs (the site has
none; §16.12 is PROPOSED) · any offline behaviour.

### 4.5 The tonal compass

The portfolio's fiction is deliberately loose. It supports several readings and
none is "the answer"; together they point the same way.

- A designer who built her studio into the **quiet side of a mountain colony**, everything frosted to soften the world.
- The personal slate of an **artisan from a desert culture that does not waste attention**: the contemplative, water-aware register of *Dune*.
- The **sanctuary interface** of a designer who decided the future should be calmer, not louder.
- A **digital monastery**: small, lit from within, no door but the one you came through.

Tonal references: safe haven, sanctuary, temple · yoga room, meditation pod,
sound-bath chamber (slow breath, soft light, a teacher who never raises her
voice) · **Apple VisionOS** for the UI (spatial glass, depth, objects that orient
toward you in a room) · *Dune* and the early Mars colony, recast as peaceful ·
a Blade Runner ambient HUD dot, for the slow-blinking status dot only · **the
living organism**: the whole product behaves like a creature that breathes, has a
pulse and has a circulatory system, literally and not as decoration · deep-sea
bioluminescence and jellyfish, for the vital signs.

The mood, in five words each: **Quiet** (no autoplay, no marquee, no urgent
calls to action; it does not need you) · **Solitary** (chosen solitude) ·
**Inhabited** (you are a guest; the room is awake) · **Personal** (the maker is
in the room) · **Soft-technological** (underfloor heating: present, important, invisible).

### 4.6 The flagship as built (all devices)

The portfolio is desktop-first. Its mechanics are not ported to a phone app, but
they are the source of every value in this manual and explain why the phone rules
are what they are.

**The scene.** A frosted glass **slab** floats in a white-out room rendered in
3D. A camera breathes and travels between four **stations**, one per page, each
with its own fog colour. Sharp HTML type is glued onto the slab's projection each
frame, so text stays crisp while living inside real depth. The glass is the 3D
shader; the HTML surface is transparent.

**Five layers.** Deeper layers sit further into the glass.

| Layer | Holds | Rule |
|---|---|---|
| **L1 World** | fog, motes, the glass slab, the camera, the breath, pointer drift | everything else is glued to its projection |
| **L2 Slab chrome** | status bar, labels, page content | rides the tilt; scroll maths must ignore transforms |
| **L3 Primary interactives** | nav capsule, social capsule, scrubber, AMBIENT toggle, main buttons | pop off the glass |
| **L4 Button accents** | pills inside the capsules, icons, the toggle knob | pop off L3 |

**The interaction law (L3 and L4).** Borrowed from VisionOS: *position in space,
billboard the face.*

1. **Cohesion.** Controls live in the slab's real tilt, one tilt source for all.
2. **Billboard.** When the slab leans away, controls counter-rotate part-way (about 60%) to face the user: readable, and a flat target for the pointer. A full billboard reads dead-flat. Hovering flattens a control to 85%, never 100%.
3. **Grow.** On tilt they enlarge by up to **+20%**.
4. **Depth pop.** On tilt, L3 lifts further off L2 and L4 off L3, with a widening soft shadow.
5. **Rest.** Head-on, everything returns to flush and resting size. The pop answers angle and is never a permanent state. *This protects the calm.*

Growth is always a transform; layout never reflows. Full tilt is taken as 7.5°.
**Hover means stillness:** a hovered control stops breathing and stops turning.
Controls also **wake** as the pointer approaches (from 210px, fully by 72px):
their rim brightens before they are touched.

**Named behaviours.**

- **Intro.** The ball is thrown, shakes, is caught; the catch becomes the ripple; the home page boots up in a cascade. On desktop it runs by itself; on touch it waits for the held press.
- **Nav and social capsules.** Tall and slender, at the slab's right edge, breathing on offset clocks (7s, the second 2.4s behind) by a 1.6px vertical drift only.
- **Scrubber.** A tape and timecode along the foot: the portfolio as a 03:30 recording with a chapter per page. Dropped on the phone.
- **The circulatory corner.** A vein web rooted in the slab's bottom-right corner, dissolving into the glass: dusty-blue respiration over about 11s, terracotta heartbeat every 3s, motes drifting along the capillaries, the web waking near the pointer. A shader on desktop with a drawn fallback; never loaded on a phone.
- **The timeline.** The magnetic node-walker and pulse relay (§16.9).
- **Dust and motes.** One particle system for the whole world: 410 fine specks at up to 22% brightness, thinned automatically on dense screens.
- **Light by the hour, and light from the cursor.** The room leans to the local hour (§11.6); motes near the pointer brighten.
- **Hover language.** A slow caustic sweep across the glass, a rim glow, a creamy effervescent liquid rising inside buttons, an elastic pop to 1.07 (buttons) or 1.035 (cards).
- **Presence cursor.** A soft 60px terracotta light trailing the pointer; on touch, blooms under the finger.
- **AMBIENT, status bar, the note, the live chip, sound**: as described in §16 and §19.

**One verdict for the device.** A single module decides "phone or desktop room"
for every layer, live, with no reload: a mouse or trackpad means desktop; a
touch-only tablet in landscape gets the desktop room with tilt, drift and hover
switched off; a window 760px wide or less, or a touch device whose shorter side is
under 600px, is the phone. On a large landscape touch screen the phone layout
appears as a floating portrait panel, 62% as wide as it is tall, with the room
visible around it.

**Locked desktop values:** slab corner 147px · slab glass `rgba(255,252,248,0.65)`
over a 24px frost, body opacity 0.46 · camera breath 11s · pointer drift ·
page order · particle budgets · fog saturation · hover flatten 0.85.

### 4.7 Rewards for the careful visitor

Small things nobody is told about. They are why the product feels made by hand.

The 5×5 pixel-grid swatch · the offset breath ("different lungs") · the
scrubber-as-timecode · the soft inset shadow that makes the slab a window with a
bezel · the drop shadow under floating controls (objects, not pictures) · the
three silver states of the mark · the ball walking the timeline · the ball you
can grab · the lowercase *plz* · the two vital signs · the self-charging
timeline · "Pir" written with the mark as the P · the almost-silent first second
after the opening burst.

---

## 5. The laws and the rails

### 5.1 The eight laws (CANON), each translated to app UI

| Law | Statement | In an app this means |
|---|---|---|
| **1. Isolation, never emptiness** | Solitude is a choice; space is a gift. Emptiness without warmth is off-brand. | Every screen is mostly air, and every screen has one living thing in it. An empty state is a room, not a blank. |
| **2. Function over form, with dignity** | Nothing is decorated for its own sake. | If you cannot say in one sentence what an element does for the user, delete it. No ornamental dividers, badges or icons. |
| **3. Minimalism is universal; its temperature is not** | Temple serene, Upper City pristine, FTZ oppressive, Lower City dense. | Density is a zone decision. Temple apps show one idea per screen. |
| **4. Nothing is pristine except by force** | Surfaces carry history. | Temple surfaces are clean *by care*: soft grain, soft shadow. Never sterile flat white. |
| **5. Light is class** | Where light comes from says where you are. | Temple light is diffused and comes from within (inner rim, soft glow). No hard spotlights, no dark vignettes. |
| **6. Grounded, never spectacle** | Restraint over neon and gore. | No confetti, no fireworks, no full-screen celebration. Success is a quiet settle. |
| **7. Technology behaves like a body** | Interfaces breathe, pulse and rest. | Motion always implies a physiology and always returns to rest (§13). |
| **8. Negative space is universal; its meaning is zoned** | Temple emptiness means peace. | About 80% of a Temple screen is empty. No composition is ever full. |

### 5.2 The hard rails (CANON, absolute)

1. Neon only as scarce diegetic fixtures in Lower City, FTZ and Divide. Never a grade. Never in Temple, Upper City, Overlay or Harsh Division.
2. **Never pure black, never pure white.** Darkest `#1E1C1A`. Lightest `#F5F4F0`. (See §11.5 for the single photographic exception.)
3. **No serifs.** Anywhere, ever.
4. The Temple is never on Earth, never ancient-looking, never violated.
5. The Lower City is never squalid or hopeless.
6. The Upper City is never cartoon-villain.
7. Oppression is geometry and light, never gore, except controlled in the two horror zones.
8. **One red, `#B8402E`, means denial.** Terracotta is never a warning.
9. **Motion always returns to rest.** Nothing demands attention without cause.
10. Negative space at the zone's temperature. No composition is ever full.
11. No element without an in-world function.
12. **The maker's name appears once per artifact.**
13. The Earth-outside question is never resolved.
14. The Divide's deep things are never seen; Harsh Division creature reveals are held for far later.

### 5.3 Standing design guards

- **The Prime Directive:** protect negative space and calm above all. Guard against unnecessary motion, chrome and element popping.
- **Type sits on the surface.** No boxes for their own sake, no bordered buttons as decoration, no new chrome on press.
- **Layout never reflows for an animation.** Growth, breath and press are transforms.
- **Everything else is a system readout.** Apart from the one spoken name, text reads as environment or instrument, not as a personal signature.
- **Flag purple copy.** Playfulness lives in a sharp word (the lowercase `plz`), never in adjectives.
- **The site does not need you.** No urgency mechanics, no autoplay, no marquee, no nag.

---

## 6. Experience principles for a handheld sanctuary

**The reframe (AS-BUILT).** The phone is the sanctuary as a
handheld object you hold to your face: a meditation pod cupped in one hand, not a
room of panels you survey. **One panel at a time.** You turn it over; you do not
tile it.

| Principle | Rule |
|---|---|
| **One surface** | One panel fills the width. Move between panels; never tile them side by side. |
| **Vertical air** | The breathing space sits above and below a single content band, not as a margin wrapped around it. |
| **Less chrome than desktop** | The phone carries one nav row and at most one readout per top corner. Anything that was a floating capsule on desktop is either dropped or moved into a page. |
| **Entering means something** | The first interaction is a held press: you set something down to come in (§17.2). |
| **Inhabited, not animated** | The room is awake whether you watch or not: a breath, a slow colour drift, a mote. None of it asks for attention. |
| **Personal** | A real face, a real number, a lowercase `plz`. The maker is in the room. |
| **Soft-technological** | Technology is underfloor heating: present, important, invisible. No dashboards. |
| **Thumb first** | Navigation lives along the bottom. Controls the user does not need constantly move up, out of the thumb zone. |
| **The strongest moment leads** | On the portfolio that is the vertical timeline. In any app, find the one natively vertical, scroll-driven moment and make it the thing people screenshot. |

---

## 7. Platform contract (PLATFORM)

An iPhone Home Screen web app, plain HTML / CSS / JS, served from GitHub Pages.
Re-verify each item on a real device; iOS behaviour changes between releases.

### 7.1 Head block

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#F2EBE0" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="APP NAME" />
<link rel="manifest" href="manifest.webmanifest" />
<link rel="apple-touch-icon" href="icons/apple-touch-icon-180.png" />
<link rel="preload" as="font" type="font/woff2" crossorigin href="fonts/sora-vf-latin.woff2" />
<link rel="preload" as="font" type="font/woff2" crossorigin href="fonts/manrope-vf-latin.woff2" />
<link rel="preload" as="font" type="font/woff2" crossorigin href="fonts/jetbrains-mono-vf-latin.woff2" />
```

- `viewport-fit=cover` lets the room's colour run under the notch and home indicator. You then own the safe areas (§8.2).
- Status bar style stays **`default`** (the site's shipped choice): dark status text on a light field. `black-translucent` gives white status text, which is unreadable on cream.
- `theme-color` is the cream field, `#F2EBE0`.
- Do not add `user-scalable=no`. Pinch zoom is an accessibility right; block zoom only inside a custom gesture surface (§14.4).

### 7.2 Manifest

```json
{
  "name": "APP NAME",
  "short_name": "APP",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#F2EBE0",
  "theme_color": "#F2EBE0",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 7.3 GitHub Pages rules

- A project site is served from **`/<repo>/`**, not from `/`. **Every URL in the app is relative** (`fonts/…`, `./`, never `/fonts/…`). This is the opposite of the portfolio, which uses root-absolute paths on its own domain.
- Add an empty **`.nojekyll`** file at the root so folders starting with `_` are served.
- Paths are **case-sensitive**.
- You cannot set response headers. Cache control comes from the service worker and from versioned file names.
- A root `404.html` is served for unknown paths. Make it in-world (§17.7).
- A single-page app should route with the **hash** or keep one document; deep paths would 404 on reload.
- HTTPS is provided, which service workers and the Home Screen install both need.

### 7.4 Home Screen behaviour

- **There is no install prompt on iPhone.** The user opens the page in Safari, then Share → Add to Home Screen. If the app is opened in a browser tab, show one quiet in-world line explaining this, once (§17.6). Detect with `navigator.standalone` or `matchMedia('(display-mode: standalone)')`.
- **The icon** is a 180×180 opaque PNG. iOS rounds the corners itself and fills transparency with black, so ship a full-bleed square on cream. Subject: the mark, capsule plus circle, on `#F2EBE0`, generous margin.
- **Storage is separate** from Safari's and can be cleared by the system. Treat local data as a cache unless the user can export it. Say so honestly where it matters.
- **No browser chrome** means no address bar and no visible back button. Every screen deeper than a root room must carry its own way back (§17.4). The system edge-swipe navigates history, so push a history entry for every in-app step you want a back-swipe to undo, and keep custom horizontal gestures off the outer ~20px of the screen.
- **Launch screen:** without `apple-touch-startup-image` files the launch is a blank field in the background colour. That is acceptable here, because the first painted frame is the cream field with the waiting ball (§17.2), and the two are the same colour.
- **Notifications** are possible for Home Screen apps only after an explicit user gesture. A Temple-register app does not ask on first launch and does not badge the icon. (CANON by Law 6 and §3.4: nothing is counted at the user.)

### 7.5 Viewport and scrolling

```css
:root { --app-h: 100vh; }
@supports (height: 100dvh) { :root { --app-h: 100dvh; } }
html, body { height: var(--app-h); margin: 0; overflow: hidden; overscroll-behavior: none; }
```

- **The document never scrolls.** Rooms are fixed to the viewport; scrolling happens inside one named scroller per room, with `overscroll-behavior: contain`.
- Hide scrollbars (`::-webkit-scrollbar { width: 0; height: 0; }`). Scroll position is communicated by the edge fade (§12.6), not by a bar.
- Size full-screen layers with `--app-h`, top-anchored (`top:0; left:0; height: var(--app-h)`), not with `inset: 0`, which can pin to the larger viewport.
- When a keyboard is open, read `window.visualViewport` to keep the focused field and the primary action visible.

### 7.6 Touch hygiene

```css
* { -webkit-tap-highlight-color: transparent; }
.chrome, .chrome * { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
```

- Instrument text (labels, nav, readouts) is not selectable. **Reading copy and contact details stay selectable.**
- Any press-and-hold surface must be unselectable and callout-free, or iOS starts a text selection instead of your gesture. This was the site's "can't enter on mobile" bug.
- Inputs use `font-size: 16px` or larger, or iOS zooms the page on focus.
- Hover does not exist. Never hide meaning behind `:hover`. Gate any hover style with `@media (hover: hover)`.

### 7.7 What iPhone web apps cannot do (design around it)

| Limit | Consequence |
|---|---|
| No `navigator.vibrate` | No programmatic haptics. All confirmation is visual and, when the user has turned sound on, sonic (§19). |
| Audio needs a user gesture | Create the `AudioContext` lazily on the first tap of the sound control. Sound defaults **off**. |
| Background execution is minimal | No timers the user must trust while the app is closed. Persist state on every change. |
| WebGL context can be lost and costs battery | The atmosphere is CSS-first (§12.2). A canvas is optional enrichment, never load-bearing. |

---

## 8. Layout

### 8.1 The canvas

- Design for a **390–430px wide** portrait viewport. The portfolio's phone canvas is **420 × 760** design px.
- The portfolio scales a fixed design box to the screen. **The app does not**: use real CSS px with a single fluid column. (PROPOSED: `max-width: 430px; margin-inline: auto;` so a large phone gains air, not width.)
- Portrait only. If rotated, the layout holds its portrait column, centred.

### 8.2 Safe areas

```css
:root {
  --safe-t: env(safe-area-inset-top, 0px);
  --safe-b: env(safe-area-inset-bottom, 0px);
}
```

The room's colour runs edge to edge under the notch. **Content and instruments never do.**

### 8.3 The four bands of a screen

Top to bottom, as shipped on the phone:

| Band | Position | Holds |
|---|---|---|
| **Readout rank** | `top: safe-t + 28px`, sides `32px` | Status readout top-left; one control or indicator top-right. Second row, if needed, at `safe-t + 56px`. |
| **Upper air** | from the readout rank to the content | Nothing. This is the frame. |
| **Content band** | inside the shell padding: `64px` top, `16px` sides, `118px` bottom | One idea. Vertically centred when it fits; a scroller when it does not. |
| **Nav row** | `bottom: safe-b + 26px`, centred, `64%` of the width | The nav capsule. Persistent across room changes. |

Add `--safe-t` to the shell's top padding and `--safe-b` to its bottom padding.
(AS-BUILT values came from a scaled stage; the shell paddings above are the
authored numbers and read true at roughly 1:1.)

### 8.4 Spacing scale

Codified from the values the site actually uses on the phone. Use these and
nothing in between.

| Token | px | Use |
|---|---|---|
| `--sp-1` | 4 | hairline gaps, pill inner padding |
| `--sp-2` | 6 | gap between nav items, icon to label |
| `--sp-3` | 10 | gap inside a cluster, label to value |
| `--sp-4` | 14 | card padding, title to body, modal inset |
| `--sp-5` | 16 | screen side gutter |
| `--sp-6` | 22 | gap between cards, between blocks in a column |
| `--sp-7` | 32 | instrument edge inset, section break |
| `--sp-8` | 48 | gap between timeline entries, major break |
| `--sp-9` | 64 | top clearance of the content band |
| `--sp-nav` | 118 | bottom clearance of the content band (nav row + air) |

Rhythm rule: **inside a group, 10–14. Between groups, 22. Between ideas, 48 or
more.** The difference between "related" and "separate" must be at least double.

### 8.5 Alignment

- **One axis per screen.** Either everything is centred on the vertical centreline (the Home "sanctuary glance": coordinates, mark, greeting, tagline) or everything shares one left edge (lists, timeline, reading text). Never mix a centred heading with left-set body in the same band.
- **Reading text is left-aligned, ragged right**, `text-wrap: pretty`. Short display statements are centred with `text-wrap: balance`.
- **Instruments align to the 32px edge inset.** Top-left readout and top-right control share one baseline.
- **A spine is an alignment device.** On the timeline, the line, the node dots and the travelling ball all centre on the same x (`26px` from the content's left edge). Anything that moves along a line stays exactly on that line.
- **Numerals are tabular** (`font-variant-numeric: tabular-nums`) wherever they change or align.
- **Optical centring over mathematical** for glyphs (a play triangle sits 2px right of centre).

### 8.6 Proportion and negative space

- **About 80% of a Temple screen is empty.** Measure it: squint, and if the content reads as more than a fifth of the area, remove something.
- A card is an **artifact with a frame of nothing**, not wallpaper. Cards are `78%` of the column width on the phone, centred, so the room shows on both sides.
- In a list, **the next item must peek** above the fold (at least ~22px visible) so scrolling is discoverable without an arrow. On short screens, shrink the first item's media, never the peek.
- A room should **not scroll unless its content is genuinely a list**. Contact on the site is engineered to fit any phone height with zero scroll: text blocks keep their size and the photo absorbs the slack.
- Reading measure: **46 characters** maximum (`max-width: 46ch`). Balanced display statements: about **26ch**.

### 8.7 Z-order

Four bands. Every stacked element belongs to exactly one.

| Token | Value | Layer | Holds |
|---|---|---|---|
| `--z-world` | 0 | L1 World | atmosphere, motes, room colour |
| `--z-slab` | 10 | L2 Surface chrome | status readout, labels, the note trigger |
| `--z-content` | 20 | L3 Content | hero, cards, lists, buttons in the page |
| `--z-nav` | 30 | L4 Navigation | the nav row, above all content |
| `--z-modal` | 80 | Detail sheet | scrim at 79, sheet at 80 |
| `--z-viewer` | 120 | Full-screen media viewer | above everything |

On the phone the world is **flat**: depth is carried by shadow and blur, not by
3D transforms. Do not port the desktop tilt, billboard or `translateZ` pop.

---

## 9. Visual hierarchy

### 9.1 Three voices, three inks

Hierarchy in this system is made by **voice and ink first, size second, weight
last.** There is no bold-for-emphasis.

| Level | Voice | Ink | Role |
|---|---|---|---|
| **Statement** | Sora, light or medium, large, tight tracking | `--t-primary` | The one thing this screen says. One per screen. |
| **Reading** | Manrope 400, 14px | `--t-secondary` | Sits deliberately quieter than the headline layer. |
| **Whisper** | JetBrains Mono, 10px, uppercase, wide tracking | `--t-whisper` | Machine text: coordinates, labels, counts, timecodes. |

### 9.2 Rules of emphasis

- **One statement per screen.** If two things compete, one becomes a whisper label.
- **Labels sit above values** in mono whisper; the value below is 13px primary. Never bold the label.
- **Selection is shown by fill, not by border or weight.** Active = terracotta fill with cream text. Inactive = translucent glass with secondary text.
- **Primary actions are filled milky pills; secondary actions are transparent pills with a hairline.** At most one filled action per cluster, two per screen.
- **Colour is not a hierarchy tool.** The signature pair marks life (pulse, breath, selection, lifeline). It never marks importance in text.
- **Depth ranks objects:** content on the glass is flat; controls float above it on a soft shadow; the nav floats highest. Shadow depth, not size, says "this is on top".
- **Order of arrival is hierarchy in time:** the statement arrives first, reading text next, instruments last (§13.4).

### 9.3 Object hierarchy on a screen

1. **The room** (colour, air): felt, not read.
2. **The one artifact** (hero, card, timeline, photo): what the eye lands on.
3. **Its words.**
4. **The nav**, findable without looking.
5. **Readouts**, discovered by the careful.

If a readout is noticed before the artifact, it is too loud.

---

## 10. Typography

### 10.1 Families (CANON voices, AS-BUILT faces)

| Voice | Face | Role | Fallback stack |
|---|---|---|---|
| **A — geometric sans** | **Sora** (variable, 200–800) | headers, wordmarks, wayfinding | `'Sora', system-ui, sans-serif` |
| **B — humanist sans** | **Manrope** (variable, 200–800) | body, values, buttons | `'Manrope', system-ui, sans-serif` |
| **M — monospace** | **JetBrains Mono** (variable, 100–800) | machine text only | `'JetBrains Mono', ui-monospace, monospace` |

**No serifs. No fourth family.**

- Self-host as variable `woff2`, `font-display: swap`, preload the latin subsets. Six files total about 141KB, kept in the app's own `fonts/` folder. All three families are free under the SIL Open Font Licence.
- Body: `font-feature-settings: "ss01", "ss02", "cv11"; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;`
- Display default tracking: `-0.01em`.

### 10.2 Type scale (phone)

| Token | Use | Face | Size / line | Weight | Tracking | Case | Ink |
|---|---|---|---|---|---|---|---|
| `hero` | the one greeting or statement | Sora | 52 / 1.05 | 300 | −0.025em | sentence | primary |
| `hero-lead` | small lead-in before the hero ("Hi!") | Sora | 36 / 1.05 | 300 | +0.005em | sentence | primary at 80% |
| `hero-sub` | tagline under the hero | Sora | 26 / 1.2 | 300 | 0 | lowercase start | secondary |
| `room-title` | room wordmark ("folio") | Sora | 40 / 1.0 | 500 | −0.02em | **lowercase** | primary |
| `heading` | section or sheet heading | Sora | 28 / 1.25 | 500 | −0.02em | sentence | primary |
| `sheet-title` | title inside a detail sheet, 2-line clamp | Sora | 24 / 1.25 | 500 | −0.02em | sentence | primary |
| `note` | a centred quiet statement | Sora | 20 / 1.45 | 300 | −0.01em | sentence | primary |
| `item-title` | timeline or list entry title | Sora | 18 / 1.3 | 500 | 0 | sentence | primary |
| `card-title` | card title | Sora | 17 / 1.375 | 500 | −0.012em | sentence | primary |
| `subtitle` | role or qualifier under a title | Sora | 14 / 1.4 | 400 | −0.005em | sentence | primary |
| `body` | reading copy | Manrope | 14 / 1.65 (1.7 in long columns) | 400 | 0 | sentence | secondary |
| `body-s` | notes under an entry | Manrope | 13.5 / 1.55 | 400 | 0 | sentence | secondary |
| `value` | a datum under a label; button text | Manrope | 13 / 1.4 | 400 | 0 | as written | primary |
| `label` | whisper label, readout, coordinates | JB Mono | 10 / 1.6 | 400 | +0.18em | UPPER | whisper |
| `nav` | nav pill code | JB Mono | 10.5 / 1 | 400 | +0.14em | UPPER | secondary, cream when active |
| `tag` | chip on an image | JB Mono | 9 / 1 | 400 | +0.16em | UPPER | secondary |
| `cue` | the one instruction at the entry ("tap & hold") | JB Mono | 11 / 1 | 600–800 | +0.20em | UPPER | `#637C92` |
| `trigger` | the quiet note trigger ("a note …") | JB Mono | 9 / 1 | 400 | +0.22em | lower | whisper |

### 10.3 Typographic rules

- **Tracking by voice:** display type is tightened (−0.01 to −0.025em); mono labels are opened wide (+0.14 to +0.22em). Body is left at 0. Never open the tracking of display type, never tighten mono.
- **Case by voice:** mono labels are uppercase (the one exception is the lowercase trigger). Room wordmarks are **lowercase** ("folio"). Button labels are lowercase ("email me", "call ↗"), with the occasional sentence-case label for a destination ("Back to folio", "Visit live ↗"). Headings are sentence case. Nothing is Title Case.
- **Weights in use: 300, 400, 500.** 600–800 appears once, on the entry cue. No bold body text.
- **A whisper-tinted ampersand.** In a tagline, the `&` takes the whisper ink while the words stay secondary. Use `&`, never "and", in the tagline.
- **Section labels** read `02 — work`: a two-digit index, an em dash, a lowercase name, set as a `label`.
- **Separators** in readouts are a middle dot with spaces: `dubai · 32° · 15:03`.
- **Arrows** are type, not icons: `↗` for leaving the app, `→` for direction, `←` for return.
- **Clamp, don't shrink.** A title that could run long gets a 2-line clamp. Do not reduce its size per item; positions must hold across items.
- **Long text scrolls inside a fixed window** with a bottom fade as the "more" cue (§12.6), rather than pushing the layout.

### 10.4 Legibility floor (PROPOSED)

The site ships 9px mono labels. They are decorative readouts there. In an app,
where a label may be the only name a control has:

- **Anything a user must read to act is 11px or larger**, and uses `--t-secondary`, not whisper.
- 9–10px whisper text is reserved for metadata the screen works without.
- Input text is 16px (§7.6).
- If the user's text size is enlarged, body and values scale; the mono instrument layer may stay fixed.

---

## 11. Colour

### 11.1 Temple palette (CANON, the live brand tokens)

| Token | Hex | Role |
|---|---|---|
| `--c-cream` | `#F2EBE0` | base field, theme colour, the mark's lower body |
| `--c-cream-deep` | `#ECE3D4` | image wells, placeholders |
| `--a-terra` | `#C77B5C` | **signature**: heartbeat, Mars warmth, selection, REC dot |
| `--a-blue` | `#7A98B3` | **signature**: respiration, lifelines, focus ring, bioluminescence |
| `--c-lavender` | `#C9B8DD` | contemplative fog |
| `--c-mint` | `#C5D9C8` | atmosphere drift |
| `--c-peach` | `#F4C9A8` | warm atmosphere drift |
| `--c-coral` | `#E89B7D` | warm atmosphere accent |
| `--c-paleblue` | `#B4C9D9` | cool atmosphere drift, active filter fill |
| `--t-primary` | `#2A2520` | primary text (warm near-black) |
| `--t-secondary` | `#6B6560` | reading text |
| `--t-whisper` | `#A8A29B` | metadata, coordinates |

Supporting tints in use: selected-pill milk `#EFEEEB` · card white `#FFFDF9` ·
terracotta light stop `#E0A284` · cream text on terracotta `#FFF9F2` · charcoal
for seams `#3A332C` · entry cue blue-grey `#637C92` · ball lower half `#E7DCC9`.

### 11.2 The signature pair (CANON, locked)

**Terracotta `#C77B5C` and dusty blue `#7A98B3`** are heartbeat and respiration.
They own the Temple and may cameo in any zone as the mark's colours.

| Terracotta is | Dusty blue is |
|---|---|
| the pulse, a thing that beats | the breath, a thing that flows |
| the selected state | the lifeline, spine or progress path |
| the live or recording dot | the focus ring |
| the touch trace under a finger | the cool glint inside glass |
| warmth. **Never a warning.** | calm. **Never a link colour.** |

Neither is ever used for body text. Neither fills a large area.

### 11.3 Room colour: each screen is its own room

A room's identity is its air, graded on a **warm-low → cool-high** axis. The
content does not change colour; the room behind it does.

| Room on the site | Fog (AS-BUILT) | Character | Use it for an app room that is… |
|---|---|---|---|
| Home | `#E8C7B0` | warm neutral, cream and peach, the entry hall | arrival, overview |
| Contact | `#E7EEEF` | cool aqua-grey, thin high air | reaching out, exchange |
| Folio | `#EBE7F1` | cool lilac, mint-touched, contemplative | browsing, a collection |
| About | `#EFE1D1` | warm terracotta and sand | history, the personal |

Rules: a room colour **must read as a colour**, not as off-white; rooms must be
distinguishable from one another at a glance; on change, the room colour
crossfades **in sync** with the content (§13.4). A new room takes a new pale grade
from the atmosphere family (PROPOSED until Pir tunes it).

### 11.4 The one red and status colours

- `#B8402E` is the universe's **only** red and means **denial or warning**. In a Temple-register app it should be almost unseen: a destructive confirmation, a refused action. Never a badge, never a notification dot.
- There is **no green for success**. Success is a settle and, at most, a brief dusty-blue or terracotta bloom (PROPOSED: this absence is deliberate; do not add a status-green token).
- "Live" or "active" is the terracotta dot, slowly blinking.

### 11.5 Dark values

- Text never goes darker than `#2A2520`.
- Deep scrims are **warm**: the media viewer's scrim is `rgba(26,22,18,0.94)`, "the room's ink, never a black box".
- **One recorded exception:** the site's desktop enlarged-photo backdrop is `#000`, a deliberate call so letterbox bands disappear. It breaks rail 2 and applies only behind a full-screen photograph. Do not extend it; on the phone use the warm scrim.
- No pure white: surface whites are `#FFFDF9`, `#FFFDF8`, `rgba(255,253,250,α)`. Pure `#FFF` appears only at partial opacity in highlights and rims.

### 11.6 Light only, with a night grade (Pir's call)

The app **ignores system dark mode.** There is no dark theme.

```html
<meta name="color-scheme" content="light" />
```

Instead the room **leans toward the user's local hour**, exactly as the site's
chrono lighting does: the room colour is blended **18%** toward an hour tint.

| Local hour | Tint (fog) | Mood |
|---|---|---|
| 05–09 | `#E9ECEA` | dawn, cool mineral |
| 09–16 | `#F3EEE3` | day, the neutral |
| 16–19 | `#F5E3C8` | golden hour |
| 19–05 | `#DDE0E8` | night, cool and bioluminescent |

Rooms stay recognisable; the hour is a mood, not a theme. Text inks do not
change. A small time glyph in the status readout follows the same hours: sun
`#E0A23C` by day, low sun `#D9913F` at 06–09 and 17–19, moon `#8B93B0` at 20–05.
The world's **red hour** (a terracotta-family wash at set hours, never alarming)
is available as a fifth band (PROPOSED: not yet built anywhere).

### 11.7 Contrast (approximate, on cream `#F2EBE0`)

| Pair | Ratio | Verdict |
|---|---|---|
| primary `#2A2520` | about 13:1 | passes everything |
| secondary `#6B6560` | about 4.9:1 | passes AA for body |
| whisper `#A8A29B` | about 2.2:1 | **fails AA.** Non-essential metadata only. |
| terracotta `#C77B5C` as text | about 2.8:1 | never use for text |
| cream `#FFF9F2` on the terracotta pill | about 3:1 | acceptable for a large, short active label; keep it ≥ 10.5px medium or raise the size |

Do not fix contrast by darkening the palette. Fix it by moving the text up one
ink (whisper → secondary) when it matters.

### 11.8 Proportion

About **80% room and air**, **15% glass surfaces and ink**, **under 5% signature
colour**. If terracotta covers more than a thumbnail's worth of the screen, it has
stopped being a pulse.

---

## 12. Surfaces and materials

### 12.1 The material idea

One sheet of frosted glass floating in a soft white-out room. Shapes drift behind
it like silhouettes through shower glass and never resolve. Controls are smaller
pieces of the same glass, standing off its surface on a soft shadow. Materials in
the world: glass, polished stone, ceramic, sandstone, light alloy, water, plants.

On the phone the main slab is **full-bleed, square-cornered and barely there**
(`rgba(255,255,255,0.12)` over the room; no rim glow). The room's colour **is**
the page. Glass becomes visible only on the things you touch.

### 12.2 Atmosphere recipe (CSS-first)

This is the site's own no-WebGL fallback, which makes it the right primary for a
plain HTML app.

```css
.room-base { background: radial-gradient(120% 100% at 50% 40%, #F7F0E4 0%, #EFE6D5 60%, #E6DAC4 100%); }
.blob {
  position: absolute; border-radius: 50%; pointer-events: none;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--c) 0%, color-mix(in srgb, var(--c) 33%, transparent) 30%, transparent 65%);
}
```

| Blob | Colour | Size | Position (x, y) | Period | Drift (px) |
|---|---|---|---|---|---|
| peach | `#F4C9A8` | 70vmax | 70%, 10% | 42s | 50, −32 |
| lavender | `#C9B8DD` | 65vmax | 5%, 25% | 55s | −36, 48 |
| mint | `#C5D9C8` | 60vmax | 35%, 75% | 48s | 32, −44 |
| pale blue | `#B4C9D9` | 55vmax | 80%, 70% | 38s | −40, 36 |
| coral | `#E89B7D` | 38vmax | 50%, 40% | 60s | 24, 28 |

Each blob has its own period and a negative start delay (`−i × 4s`) so they never
sync. Blob **opacity** sets the room:

| Room | peach | lavender | mint | pale blue | coral |
|---|---|---|---|---|---|
| warm neutral (home) | 0.80 | 0.78 | 0.78 | 0.78 | 0.60 |
| cool aqua (contact) | 0.14 | 0.34 | 0.74 | 1.00 | 0.10 |
| lilac (folio) | 0.12 | 1.00 | 0.50 | 0.24 | 0.10 |
| warm sand (about) | 1.00 | 0.30 | 0.20 | 0.10 | 1.00 |

Animate blob `transform` only; crossfade `opacity` on room change. No `filter:
blur()` on the blobs: the radial gradient is the softness.

Optional enrichment: a dozen motes at 5–10% opacity drifting slowly. One particle
system for the whole app. If the air ever reads busy, thin it.

### 12.3 Grain

A faint sensor grain over surfaces, pure CSS, **no blend mode**:

```css
.grain::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  background-image:
    radial-gradient(rgba(60,40,20,0.025) 1px, transparent 1px),
    radial-gradient(rgba(60,40,20,0.018) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px; background-position: 0 0, 1px 2px;
}
```

### 12.4 Glass recipes

| Surface | Fill | Edge | Blur |
|---|---|---|---|
| **Nav capsule / pill** (static) | `rgba(255,253,250,0.38)` | `1px solid rgba(255,255,255,0.65)` | `blur(18px) saturate(150%)` |
| **Card on glass** | `rgba(255,253,249,0.5)` | `1px solid rgba(255,255,255,0.5)` | none |
| **Detail sheet** | `linear-gradient(148deg, rgba(255,255,255,1) 0%, rgba(255,253,250,0.95) 38%, rgba(252,248,242,0.95) 100%)` | `1px solid rgba(255,255,255,0.65)` | none (baked) |
| **Data cell** | `rgba(255,253,250,0.45)` | `1px solid rgba(60,50,40,0.06)` | none |
| **Tag on an image** | `rgba(255,253,250,0.85)` | none | none (baked) |
| **Selected pill** | `linear-gradient(160deg, #E0A284, #C77B5C)` | `rgba(255,255,255,0.55)` | none |
| **Filled action** | `#EFEEEB` | `1px solid rgba(255,255,255,0.9)` | none |
| **Ghost action** | transparent | `1px solid rgba(60,50,40,0.10)` | none |
| **Light scrim** (behind a sheet) | `rgba(233,229,241,0.5)`, leaned toward the room's colour | — | none |
| **Note veil** | `rgba(246,239,226,0.66)` | — | `blur(6px)` |
| **Viewer scrim** | `rgba(26,22,18,0.94)` | — | none |

**The blur law.** `backdrop-filter` is allowed only on an element that **does not
move, scale or fade every frame**: the fixed nav row, a static veil. Anything that
animates, scrolls or sits inside an animating parent uses a **baked** frost: a
milkier solid fill. On the phone a sheet over content needs a dense veil (0.95),
or the list and nav behind it ghost through. Always write both `-webkit-backdrop-filter`
and `backdrop-filter`.

### 12.5 Shadows

All shadows are **warm** (`rgba(40,30,20,α)`), soft, offset downward, with a
negative spread so they sit under the object rather than around it. Every floating
surface also carries a 1px inner top highlight: the lit lip of the glass.

| Token | Value | Use |
|---|---|---|
| `--sh-lip` | `inset 0 1px 0 rgba(255,255,255,0.9)` | on every glass piece |
| `--sh-card` | `inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 1px rgba(40,30,20,0.04), 0 20px 40px -16px rgba(40,30,20,0.12)` | resting card |
| `--sh-pill` | `inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(40,30,20,0.06), 0 12px 28px -12px rgba(40,30,20,0.22)` | floating capsule |
| `--sh-nav` | `inset 0 1px 0 rgba(255,255,255,0.9), 0 22px 44px -14px rgba(40,30,20,0.40)` | the nav, highest float |
| `--sh-soft` | `0 12px 28px -8px rgba(40,30,20,0.32)` | any control when pressed, and resting filled actions |
| `--sh-selected` | `0 10px 22px -8px rgba(199,123,92,0.55), inset 0 1px 0 rgba(255,255,255,0.5)` | the terracotta selected pill |
| `--sh-sheet` | `inset 0 1px 0 rgba(255,255,255,0.95), inset 0 2px 30px -10px rgba(255,255,255,0.64), inset 0 -24px 54px -34px rgba(40,30,20,0.14), 0 2px 6px rgba(40,30,20,0.09), 0 22px 46px -20px rgba(40,30,20,0.3), 0 52px 116px -34px rgba(40,30,20,0.54)` | the detail sheet |
| `--sh-band` | `inset 0 1px 0 rgba(255,255,255,0.85), inset 0 18px 26px -18px rgba(42,32,22,0.32)` | a text band under an image, so it reads as thick glass |

Shadows are **static**. Do not animate `box-shadow` per frame; switch between two
states with a transition.

### 12.6 Edge fades (the scroll language)

Content never meets a hard clip. A scroller dissolves into the glass with a mask.

```css
/* symmetric: a column running through the glass */
.fade-both { --fade: 150px;
  mask-image: linear-gradient(to bottom,
    transparent 0, rgba(0,0,0,.35) calc(var(--fade)*.47), #000 var(--fade),
    #000 calc(100% - var(--fade)), rgba(0,0,0,.35) calc(100% - var(--fade)*.47), transparent 100%); }

/* scroll-past: what you have read dissolves at the top */
.fade-top { mask-image: linear-gradient(to bottom,
    transparent 0, rgba(0,0,0,.35) 60px, #000 140px, #000 calc(100% - 14px), transparent 100%); }

/* more below: the last line ghosts out */
.fade-more { mask-image: linear-gradient(to bottom, #000 calc(100% - 40px), transparent 100%); }
```

Write the `-webkit-mask-image` twin for each. Both ends of a symmetric fade use
the **same** token, so they are the same fade by construction. A masked scroller
gets its own layer: `transform: translateZ(0); contain: paint;`.

### 12.7 Radii

| Token | px | Use |
|---|---|---|
| `--r-pill` | 999 | pills, buttons, tags, dots |
| `--r-capsule` | 24 | the nav capsule on the phone (28 on desktop) |
| `--r-card` | 20 | cards and sheets |
| `--r-photo` | 18 | portrait or photo plate |
| `--r-thumb` | 14 | media inside a card |
| `--r-cell` | 12 | small data cells |
| `--r-focus` | 4 | focus ring corner |

The desktop slab's **147px** corner is a locked desktop value. On the phone the
main surface has **no corner radius at all**: it is the screen.

Nesting rule: an inner radius is the outer radius minus the padding between them
(card 20, padding 14 → thumb 14 reads right by eye; do not compute it to 6).

---

## 13. Motion

### 13.1 Principle

**Technology behaves like a body** (Law 7), and **all motion returns to rest**
(rail 9). The Temple's verb is **breathes**: 8–12 second cycles, eased, partial,
on offset timing ("different lungs"), resting when observed.

Three kinds of motion exist. Keep them apart.

| Kind | Purpose | Character | Governed by |
|---|---|---|---|
| **Ambient** | the room is alive | very slow, tiny amplitude, endless | the AMBIENT switch |
| **Response** | the thing you touched answers | fast in, elastic settle, under 0.6s | always on (simplified under reduced motion) |
| **Passage** | you moved between places | long, indulgent, staggered | always on (instant under reduced motion) |

### 13.2 Curves and durations

| Token | Value | Use |
|---|---|---|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | state changes: colour, fill, shadow |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | arrivals, sheets, fades in |
| `--ease-reveal` | `cubic-bezier(0.22, 1, 0.36, 1)` | staggered reveals and the room crossfade |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | leaving |
| `--ease-pop` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | one overshoot: a catch, a pop |
| `--ease-breath` | `cubic-bezier(0.42, 0, 0.58, 1)` | every ambient loop |

| Token | ms | Use |
|---|---|---|
| `--d-press-in` | 90 | squash on touch-down |
| `--d-press-out` | 580 | elastic settle on release |
| `--d-quick` | 240–280 | fill, colour, small moves |
| `--d-state` | 400 | selected-state colour change |
| `--d-sheet` | 460 | sheet and scrim fade (phone) |
| `--d-step` | 420 | slide between media plates |
| `--d-reveal` | 1000 | one item's settle |
| `--d-reveal-step` | 90 | stagger between items |
| `--d-reveal-base` | 1300 | wait before the first item, so content arrives after the crossfade |
| `--d-cross` | 1680 | room crossfade (2400 × the phone's 0.7 dial) |
| `--d-chrome-return` | 980 | wait before instruments fade back (1400 × 0.7) |

**Springs.** The elastic settles were GSAP eases (`elastic.out(1.3, 0.32)` for a
press, `elastic.out(1.15, 0.4)` for a pop, `back.out(1.7)` for a card settling).
In plain CSS, approximate them with `--ease-pop` for a single overshoot, or with a
`linear()` easing for a true multi-bounce spring (verify support on the target
iOS). In JS, the Web Animations API or a small `requestAnimationFrame` spring is
enough. A single vendored animation library is acceptable; two are not. Do not
load one from a CDN: the app must run offline.

### 13.3 Response: touch feedback

| Element | On touch-down | On release |
|---|---|---|
| **Any button** | scale to **0.90** in 90ms; `--sh-soft` appears | elastic settle to 1 over 580ms |
| **Card** | scale to **0.985** in 120ms | back to 1 in 300ms, then it opens |
| **Nav pill** | fills with a creamy effervescent pour in 0.55s: 8 small bubbles rising, 0.05s apart | the pour **holds through the room change** (about 2.6s), then drains slowly over 1.1s, so the choreography is seen after the transition, not lost under it |
| **Toggle** | thumb slides 480ms on `--ease-out`, stretching to `scale(1.5, 0.7)` mid-travel; a cream glint sweeps the track in 720ms | settles |
| **Bare screen** | a 48px terracotta bloom (`rgba(199,123,92,0.27)` → transparent) expands 0.3 → 2.6 and fades over 700ms | — |
| **Hold surface** | scale to 0.93 in 240ms; a 2px terracotta ring grows 0.55 → 1.15 over the hold duration | completes, or springs back if released early |

Touch has no hover phase, so everything that was a hover reward on desktop must
either play **on tap** or be dropped. Never leave a hover-only affordance.

### 13.4 Passage: choreographies

**Room change** (the glass crossfade).

1. Outgoing and incoming rooms render together. There is **no blank beat**.
2. Outgoing: opacity 1 → 0 and scale 1 → **0.98**, over `--d-cross × 0.92`.
3. Incoming: opacity 0 → 1 and scale **1.025** → 1, over `--d-cross`, on `--ease-reveal`.
4. The room colour crossfades over the same window.
5. Instruments (readouts, toggles) fade out, wait `--d-chrome-return`, then fade back **one by one**, `--d-reveal-step` apart. Opacity only.
6. **The nav row does not fade.** It stays put as home base.
7. Incoming content waits `--d-reveal-base`, then settles item by item.
8. **Opacity and gentle scale only. Never animate blur.**

**Item settle** (the reveal). Each item fades in while arriving from 40px behind
the surface, overshoots 10px toward you, and settles:

```css
@keyframes settle {
  0%   { opacity: 0; transform: perspective(480px) translateZ(-40px); }
  55%  { opacity: 1; }
  78%  { transform: perspective(480px) translateZ(10px); }
  92%  { transform: perspective(480px) translateZ(-3px); }
  100% { opacity: 1; transform: perspective(480px) translateZ(0); }
}
.reveal > * { animation: settle var(--d-reveal) var(--ease-reveal) both;
              animation-delay: calc(var(--d-reveal-base) + var(--i, 0) * var(--d-reveal-step)); }
```

Every element of a cluster is its own item with its own step: they arrive as
individuals, never as one block. A flat alternative for surfaces that must not
use 3D: opacity plus `scale(0.965 → 1.008 → 1)`.

**Order of arrival.** Words lead, the machine follows. On the timeline, the text
cascades first and the spine, dots and ball fade in five steps later.

**First arrival** (boot cascade, once per launch): centre glow blooms (1500ms) →
statement lines rise 16px and fade in (760ms each, at 220 / 400 / 600ms) → nav
locks in with a small settle (640ms, at 760ms) → ambient layers ease up last
(1200ms, at 950ms). Total 1–1.8s. Not a uniform fade.

**Sheet open and close.** On the phone a sheet is an **opacity-only** fade, 460ms
on `--ease-out`, both directions. No scale, no slide: a transform on a sheet over
live content caused text shimmer and ghost tiles on iOS. Close waits for the fade
before unmounting.

**Media viewer.** Slide between plates in 420ms on `--ease-out`. A newly opened
plate may "peek" once: `scale(1 → 1.045 → 1)`, a single hint that the frame holds
more. Once, then rest.

### 13.5 Ambient: the living elements

Each is optional. Choose the ones the app needs; a screen needs only one.

| Element | Behaviour | Notes |
|---|---|---|
| **The breathing mark** | Capsule and circle crossfade through the colour population on **different clocks**: capsule every 6.5–7.5s, circle every 7.5–8.5s, started 1.8–3.2s apart. On the 404 they scale ±5% in opposite phase over 7s. | The soul of the brand. Watch only the stem, then only the head: never in sync. |
| **The room's breath** | One slow cycle of about **11s** across the atmosphere. | The world's lung. |
| **The heartbeat** | Mostly dim; every **3s** a quick double bloom: lub 0.13s up, 0.20s down, dub 0.11s up, 0.30s down, then rest. Terracotta. | The site's shader version is desktop-only. On the phone, express the pulse on something small (a dot, a spine), never as a full-screen effect. |
| **Respiration** | Over ~11s a dusty-blue glow wells up, holds, drains. | Pairs with the heartbeat: two rhythms, never locked. |
| **Blob drift** | 38–60s loops (§12.2). | Transform only. |
| **Motes** | A dozen specks, 5–10% opacity, slow drift. | Barely visible. |
| **Live dot** | 7px terracotta dot, opacity 1 ↔ 0.4 over **3s**; quickens to 0.9s for 1.7s after a navigation. | Presence, not alarm. |
| **Invitation** | A soft dot breathing opacity 0.45 ↔ 1 over 4s; or a 1px terracotta halo expanding 0.8 → 2.2 over 2.8s. | **Stops inviting** after about 14s or the first use. Invitations never nag. |
| **Active sheen** | On the selected pill, a cream band drifts across over 4.2s at 50% opacity. | Selected feels alive, not lit. |
| **Media drift** | In an open detail, the image drifts ≈ 2.6% and breathes scale 1.06 ↔ 1.13 over 16s. | Open views only. Never on list thumbnails at rest. |

**Rules for ambient motion.**

- Amplitude is tiny: 1–2px of travel, a few percent of scale, opacity never below a visible floor.
- Two looping things never share a period or a phase.
- **Nothing breathes under a finger.** Pause an element's ambient motion while it is pressed.
- Breathing never changes layout: opacity, glow, or 1–2px translate only.
- On the phone, the nav capsule does **not** bob.

### 13.6 The AMBIENT switch and reduced motion

- **AMBIENT** is the user's master motion control: a small labelled toggle (`ambient · full` / `ambient · min`). **Off freezes every ambient element to a calm resting state**, visible but still (motes at half opacity, loops paused mid-cycle). It does not gate the entry ritual or scroll-driven motion.
- Implementation: stamp `data-ambient="on|off"` on `<html>` and gate with `animation-play-state: paused`.
- **`prefers-reduced-motion: reduce`** calms only large and vestibular motion: the entry shake, the room-change scale, the item settle, the content pop. These become instant or opacity-only. The gentle ambient room **keeps breathing**; AMBIENT is the control for that. A reduced-motion visitor skips the hold ritual and enters on a short quick path.
- Under either setting, nothing is hidden: frozen means still, never absent.

### 13.7 Motion don'ts

No autoplay. No marquee. No looping attention-seekers. No parallax on scroll. No
bounce on scroll end. No animated blur. No animated `box-shadow`, `width`,
`height`, `top` or `border-width`. No second physics toy. No motion that replays
on idle. No celebration.

---

## 14. Interaction and gestures

### 14.1 Targets

- **Hit area ≥ 44 × 44px** (PROPOSED as the app floor). The site's phone buttons are 34px visually; keep that visual size where it looks right and extend the hit area with padding or a pseudo-element.
- Neighbouring targets are at least 6px apart.
- Primary navigation sits in the bottom third. Rarely-used controls sit top-left and top-right, out of the thumb's way on purpose.

### 14.2 The gesture vocabulary

| Gesture | Meaning | Where |
|---|---|---|
| **Tap** | commit | everywhere. One tap opens; there is no "reveal, then open". |
| **Press and hold (720ms)** | set something down; cross a threshold | the entry, and any deliberate, meaningful commitment |
| **Vertical scroll** | read; travel a timeline | the one scroller of a room |
| **Horizontal swipe (≥ 60px)** | step between sibling plates | media viewers only |
| **Pinch, drag** | zoom and pan | the full-screen viewer only (max 4×) |
| **Double tap (within 280ms)** | zoom to the tapped point (2.5×), again to reset | the full-screen viewer only |
| **Tap the scrim** | dismiss a sheet | phone sheets |

### 14.3 Two surfaces, one answer each

A gesture belongs to exactly **one** surface. When a view has a pinned media area
and a scrolling text area: the media is a **closed gesture surface**
(`touch-action: none`, axis-locked drag) and the text owns its own scroll. A
vertical swipe on the media moves nothing; a horizontal swipe never scrolls the
page. Never promise the browser one gesture (`pan-y`) and claim the pointer in JS
for another.

### 14.4 Drag rules

- **Axis lock:** decide horizontal or vertical from the first movement **before** claiming the pointer.
- **Tap slop:** 6px of travel turns a tap into a drag.
- A swipe never reads as "tap to close": track whether the pointer moved.
- Stepping to a new plate always lands un-zoomed.
- While zoomed, swipe-to-step and tap-to-close are disabled; pan owns the finger.
- A deferred single-tap action (waiting out the double-tap window) is cancelled by any new gesture.

### 14.5 Scroll rules

- One scroller per room. `overscroll-behavior: contain`.
- Changing a filter or tab **resets the scroller to the top**, instantly.
- **Settle-snap for discrete content:** when the scroll has been still for ~140ms, glide the nearest item to its rest position (about a 300ms ease). Never fight an active scroll or its inertia. Plain scroll, not CSS scroll-snap, is what shipped.
- Text nearer the focus line is at full ink; text further away fades toward a floor of ~16% so one entry is read at a time.
- Read scroll position from `scrollTop`, not from layout rectangles, whenever an ancestor is transformed.

### 14.6 States every control must define

| State | Treatment |
|---|---|
| Rest | translucent glass, secondary ink |
| Pressed | squash 0.90 + `--sh-soft` |
| Selected / current | terracotta gradient, cream text, `--sh-selected`; `aria-current="page"` or `aria-pressed` |
| Focus (keyboard) | `outline: 1.5px solid rgba(122,152,179,0.6); outline-offset: 3px;` |
| Disabled | opacity 0.4, no shadow, no response (PROPOSED) |
| Loading | the control keeps its size; its label gives way to a slow blink (PROPOSED) |

---

## 15. The mark, the ball, icons and imagery

### 15.1 The mark

- Construction: viewBox `100 × 140`. **Capsule** at x 6, y 4, 44 × 132, radius 22. **Circle** centred 68, 40, radius 36, behind the capsule. The capsule casts a soft shadow onto the circle.
- It is a physical object in the space: it carries a drop shadow (`0 10px 16px rgba(40,30,20,0.14)` at 64px).
- In running text it replaces the **P** of "Pir": width `0.95em`, dropped `0.18em` to sit on the baseline. The following letters are set normally.
- **Colour population.** The mark cycles `[capsule, circle]` pairs in a deliberate order so the breath never lands on the same mood twice:

  | Band | Pairs |
  |---|---|
  | pastel | `#BFC8DD/#C9B8DD` · `#D5C8E2/#BFCBDC` · `#C9B8DD/#B4C9D9` · `#E0CFD9/#C9C9E0` · `#C5D9C8/#F2EBE0` · `#F4C9A8/#B4C9D9` |
  | split | `#B4C9D9/#C9B8DD` · `#A7B89A/#F2EBE0` |
  | saturated | `#4E6FB8/#C9B8DD` · `#E89B7D/#F4E4B8` · `#7A98B3/#E89B7D` · `#5A7A5A/#9DA56A` |
  | silver | `#9C9C9C/#C8C8C8` (mid) · `#3F3F42/#E8E8EA` (luminous inversion) · `#D6D6D8/#5C5C60` (high-contrast light) |
  | earth | `#B89BA8/#C77B5C` · `#9A9A8A/#A8A878` · `#C9B8B0/#A7B89A` |

- Static uses: terracotta capsule `#C77B5C` with a cream circle `#E7DCC9` outlined in terracotta (the 404), or lavender `#B9A7E8` with blue `#A7BCE8` on cream (the favicon).
- The hidden signature: a **5×5 pixel-grid swatch** of the population.

### 15.2 The ball (kept, by Pir's call)

The entry object and the timeline walker is a Pokéball in brand colours. Pir has
chosen to keep it for this Home-Screen-distributed app. It is a third party's
trademark; that was raised once and is closed.

- **One identity, used everywhere:** top hemisphere terracotta (gradient `#D08C6E` → `#C77B5C`), bottom hemisphere cream (`#F7F1E7` → `#E7DCC9`), seam and button charcoal `#2A2520`, a soft white sheen at upper-left. **No red-and-white version exists anywhere.**
- Sizes: 72px at the entry, 46px on the timeline.
- Behaviours: rocks on its base (−7° ↔ +7°, 850ms per half swing, eased, pivot at 50% 88%); its centre button glints once per swing; squashes to 0.93 under a held press; pops on catch (`scale(1.16, 0.86)` → `(0.94, 1.07)` → 1 in 420ms); its seam can crack open with a bloom of palette light.
- On a timeline it **docks** at the active node, detaches with squash and stretch, arcs to the next node, and snaps in with a damped wobble. Ball = heart, snap = muscle, pulse = blood.
- It is the product's **one physics toy**: it may be grabbed and flicked, and it always settles back.

### 15.3 Icons

- Inline SVG, drawn in `currentColor`, no icon font, no external sprite.
- Thin rounded strokes, about 1.6px at 24px, round caps and joins. Small glyphs (13–16px) are simple filled shapes.
- Icons sit inside 34–36px circular buttons. **An icon alone always has an `aria-label`.**
- Use type before icons: `↗ → ←`, three-letter codes (`CON`, `FOL`, `ABO`), a word. An icon earns its place only where a word would be longer and less clear.
- No emoji in UI. No filled multicolour icons.

### 15.4 Imagery

- Photographs are **plates**: framed objects with a 14px inner radius inside a 14px-padded card, never full-bleed wallpaper behind text.
- Each plate has a focal point (`object-position: x% y%`), a zoom, and a fit (`cover` crops, `contain` shows all). The **phone gets its own crop**: a card on a phone is a different shape from the enlarged view.
- Ship **two files per image**: a light thumbnail (~1200px) for lists and the full plate for the viewer. WebP. Load list covers **eagerly** if they are light; lazy-loading mid-scroll read as lag.
- **Video rests as a still** (a chosen poster frame) and plays only on a deliberate tap. One clip moves at a time. Stepping or closing pauses it. Muted, `playsinline`.
- **No image yet?** Use an atmosphere gradient, never a grey box:
  `radial-gradient(118% 92% at 28% 16%, rgba(255,255,255,.52), transparent 56%), linear-gradient(150deg, A 0%, B 100%)` with A and B drawn from the six atmosphere colours.
- Photographic content should sit comfortably beside pastel earth tones: soft light, low contrast, warm. A portrait of the maker is welcome; it is what makes the room personal.

---

## 16. Component catalogue

Each component: what it is for, its anatomy, its numbers. All Temple register.

### 16.1 Status readout

*An environmental readout, not a logo.* Top-left.

- `label` style, `--t-secondary`, 16px tall row, 8px gap: a 13px time glyph, then `dubai · 32° · 15:03`. Tabular numerals.
- Shows real, local, honest data, re-synced on the minute boundary.
- On first launch it **types itself** in, one character per 52ms, with a 6 × 12px block caret blinking at 0.7s; the caret disappears 350ms after the last character.
- It names a place and a condition. It never names the maker.

### 16.2 Nav capsule

*The one persistent navigation.* Bottom centre.

- A glass capsule (§12.4), `--r-capsule` 24, padding `6px 10px`, **64%** of the width, `--sh-nav`.
- Contents in a row, gap 5–6px: a **home** button (34px circle, grid glyph), a 1 × 20px divider `rgba(60,50,40,0.10)`, then the destination pills sharing the remaining width equally.
- Pills: 34px tall, radius 17, `nav` type, resting fill `rgba(255,253,250,0.28)` with a `1px rgba(60,50,40,0.08)` edge.
- Labels are **fixed-width three-letter codes** (`CON`, `FOL`, `ABO`). They never expand into words, on press or when active.
- Active: the terracotta treatment plus the drifting sheen.
- **3 to 4 destinations plus home.** More than that means the app's structure is wrong, not the bar.
- It does not fade during room changes and does not bob.

### 16.3 Buttons

| Type | Anatomy |
|---|---|
| **Filled action** | pill, padding `10px 20px`, `value` type, fill `#EFEEEB`, edge `1px rgba(255,255,255,0.9)`, `--sh-soft` at rest so it floats. Optional 16px leading icon, 8px gap. |
| **Ghost action** | same shape, transparent, edge `1px rgba(60,50,40,0.10)`, secondary ink, no shadow. |
| **Icon button** | 34–40px circle, fill `rgba(255,253,250,0.5)`, edge `1px rgba(60,50,40,0.08)`, secondary ink. |
| **Text trigger** | a 7px breathing dot plus a `trigger` label. Padding `6px 2px`. For optional, discoverable things. |

Filled actions may take a per-room accent: a 16% top wash and a 55% edge in the
room's accent colour. Off by default.

### 16.4 Toggle

- Track 27 × 13px, radius 999, `rgba(60,50,40,0.10)`, inner shadow `inset 0 1px 2px rgba(40,30,20,0.12)`.
- Thumb 9px, inset 2px, `linear-gradient(160deg, #FFFDF8, #EAE0CC)`; when on, it travels 14px and becomes `linear-gradient(160deg, #E0A284, #C77B5C)`.
- Always paired with a mono label that states the current value: `ambient · full`.
- Hit area extended to 44px.

### 16.5 Filter tabs

- A wrapping row of pills, gap 6px. `label` type, padding `6px 14px`.
- Idle: transparent, whisper ink. Active: fill `#B4C9D9` (or the milky `#EFEEEB`), primary ink, `1px rgba(255,255,255,0.9)` edge, `0 6px 16px -8px rgba(40,30,20,0.22)`.
- First tab is `ALL`. Changing tab re-deals the list from the top; each item replays its settle.
- **Emphasis by fill, not by border.**

### 16.6 Card

- Glass card (§12.4), `--r-card`, padding 14, `--sh-card`, `contain: layout paint`.
- **Media well** on top: aspect about 16:12 on the phone (settings range 1.14–1.6), radius 14, `--c-cream-deep` behind, inner highlight. A **tag** chip sits bottom-left, 12px in.
- **Text** below with 14px above it: `card-title`, then a `label` line `discipline · year` 6px beneath.
- Width **78%** of the column, centred, 22px between cards.
- Tap opens directly.
- Accessible name: `title — discipline, year`. `role="button"`, `tabindex="0"`, Enter and Space activate.

### 16.7 Detail sheet

*A selected item, in-world, over the room.*

- Scrim over the whole surface; sheet inset **14px** on the sides and bottom, `safe-t + 14px` on top. It may cover the nav.
- **Media window** on top; a **story band** along the foot, `min(54%, 430px)` tall, separated by a `1px rgba(255,255,255,0.22)` hairline and `--sh-band`.
- The band is a **three-zone lock**, so positions never jump between items:
  1. **Head, pinned:** a `label` eyebrow (`01 · CATEGORY · 2026`), then the `sheet-title`, clamped to 2 lines.
  2. **Middle, flexible:** the reading text in its own scroller, minimum height **120px** (about 3.5 sentences), with a 40px bottom fade as the "more" cue.
  3. **Foot, pinned:** a row of 2–3 **label over value** pairs, centred, each at least 46px tall; then the actions on one line, no wrapping.
- Exits: the ghost action ("Back to …"), a tap on the scrim, the system back gesture.
- `role="dialog"`, `aria-modal="true"`, labelled by its title. Focus moves in on open and returns on close.

### 16.8 Media viewer

*The plate leaves the card and takes the screen.* A wide image fitted into a tall
card is unreadable; so the viewer is full-screen.

- Warm scrim `rgba(26,22,18,0.94)`. The whole plate fitted with 10px of air.
- Gestures per §14.2. Only the current plate and its neighbours are mounted.
- **Controls:** a counter chip top-centre (`label`, tabular, e.g. `03 / 12`), and a **close pill at the bottom centre** (`close`, 11px mono, fill `rgba(250,247,242,0.92)`). The exit lives where the thumb is.
- Page indicator in a small carousel: **at most three dots**, a sliding window.
- Clip plate: a centred **56px disc** (`rgba(250,247,242,0.92)`, `1px rgba(255,255,255,0.7)` edge, `0 10px 28px -12px rgba(40,30,20,0.45)`) with a 16px play or pause glyph. While playing, the disc rests at 40% opacity.
- Two portrait images in a row may share one page, side by side with a 10px gap.

### 16.9 Timeline

*A vertical lifeline. The strongest phone moment.*

- **Spine:** a 2px dusty-blue line at x = 26px; a 3px brighter overlay marks the charged, already-passed length. Passed segments stay lit; upcoming are dim.
- **Entries:** 48px apart, text capped at 440px wide: `label` year → `item-title` → optional `subtitle` → `body-s` note.
- **Nodes:** a dot on the spine level with each year line (9px below the entry top). The active node pops once (`scale 1 → 1.18 → 1`, 520ms).
- **The walker** docks on the active node. Focus line at **30%** of the scroller height on the phone, easing to 86% near the end so the last entries can reach it.
- **Pulse:** when the walker lands, a glow travels the spine to the next node at ~420px/s (0.35–1.3s), with a trailing tail up to 88px, and blooms into the node. It stays **exactly on the spine** and is clamped to its ends.
- The whole column fades at both ends with the same 150px fade.
- A closing mark (the P) hangs below the last node with 48px of calm beneath it.

### 16.10 Data cell and label-value pair

- **Cell:** padding `10px 12px`, `--r-cell`, fill `rgba(255,253,250,0.45)`, edge `1px rgba(60,50,40,0.06)`. `label` above, `value` 2px below.
- **Bare pair** (inside a sheet): the same two lines with no cell fill, centred.
- Links inside values inherit colour and carry no underline; the external arrow `↗` belongs on buttons, not on values.
- Stack to one column on the phone. If actions already carry the same information, drop the cells entirely (the phone Contact page does).

### 16.11 Live chip

- `label` text `rec` with the 7px terracotta dot, top-right.
- On navigation it **morphs**: widens (max-width 0 → 56px over 460ms) to show `→ fol`, holds 1.7s, and settles back to the dot. Screen readers ignore the transient part.
- One readout per corner. On the phone this chip takes the toggle's corner on inner rooms.

### 16.12 Text input (PROPOSED: the site has no forms)

- A single line resting on the glass: no box. A `label` above; the field is 16px Manrope in primary ink with a 1px bottom hairline `rgba(60,50,40,0.10)`.
- Focus: the hairline becomes dusty blue `rgba(122,152,179,0.6)` over 240ms. No glow, no outline box.
- Placeholder in whisper ink, lowercase, a plain example of what to type.
- Error: the hairline becomes `#B8402E` and one calm sentence appears below in secondary ink (§18.4). The field never shakes.
- Multi-line fields grow with content up to a cap, then scroll with a bottom fade.
- One field per idea; a long form is split across steps with a ghost "back" and one filled action.

### 16.13 The quiet note

- A text trigger (`a note …`) that is not shown on arrival as content, only as a soft dot.
- On tap, a veil fades in over 800ms (`rgba(246,239,226,0.66)`, 6px blur) and a centred `note` statement rises 10px over 900ms. `max-width: 26ch`, balanced.
- It **dismisses itself after 7s**, or on a tap anywhere.
- Use it for the app's one sentence of intent. One per app.

---

## 17. Navigation and user journey

### 17.1 The shape of the app

- **Rooms, not pages.** A small fixed set of peer rooms, each with its own air (§11.3). The portfolio has four. An app should have **three to five**.
- **Flat.** Rooms are peers reached from the nav. Depth is one level: a room opens a sheet; a sheet may open the viewer. There is no third level of drill-down.
- **Fixed order.** The rooms have one canonical order used everywhere (nav, any progress indicator, direction of travel). On the portfolio it is locked: **HOME → CONTACT → FOLIO → ABOUT**. Decide the app's order once with Pir and never vary it.
- Navigation happens **only** on an explicit tap of the nav. No swipe between rooms, no auto-advance.

### 17.2 Arrival: the setting-down

The entry is the most meaningful gesture in the product. Do not reduce it to a
splash screen.

```
1  FIELD      Cream field, faint grain. Nothing else.
2  WAITING    The ball floats at centre, rocking, its button glinting.
              It IS the loader: it waits while fonts and assets arrive.
              Label under it: REMAKE 2.0 · INITIALIZING   (whisper)
3  INVITED    When ready, the label becomes: TAP & HOLD   (cue style,
              gently fading in and out), with a small terracotta chevron
              bobbing toward the ball.
4  HOLD       The visitor presses and holds for 720 ms. The ball stills and
              sinks to 0.93; a terracotta ring grows around it.
              This is the setting-down: they stop the count to enter.
              Released early, it springs back. Nothing is lost.
5  BLOOM      The ball pops; a liquid ripple opens: three soft concentric
              rings expanding from centre over 1.5 s, thinning as they grow,
              with a soft drop swelling beneath them.
6  BOOT       The room assembles under the still-expanding rings (§13.4):
              glow, statement, nav, ambient. The first second after the
              burst is almost silent.
```

Timings from the hold completing: catch at 0ms, ripple at 430ms, room content
mounts at 820ms, overlay clears at 1760ms.

Rules:

- **No skip button.** The waiting is diegetic; there is no separate spinner.
- The hold is **required** on the phone. The room never opens on its own. (Reduced-motion visitors enter automatically on a short path.)
- The ripple plays over an **empty** surface; content mounts once, never twice.
- The ritual plays **once per launch**. Returning to the first room later is an ordinary room change.
- The entry surface is unselectable and callout-free (§7.6).
- Ripple rings are radial gradients animated with `transform` and `opacity` only, authored at final size and scaled up from near zero.

**Repeat launches (PROPOSED).** The site holds the waiting ball for at least 5.2s
because a portfolio is visited once. An app is opened daily. Keep the full ritual
for the **first launch** and after long absence; on ordinary launches shorten the
wait to the minimum (ball appears already invited, about 1s) while **keeping the
hold**. The hold is the meaning; the wait is not.

### 17.3 The first room

- A **centred sanctuary glance**: whisper coordinates on top (`n 25.276° · e 55.296° · dubai`, tracking opened to 0.26em), then the statement, then the tagline. Side padding 20px.
- This is the **only place the maker's name is spoken**: `Hi! I am [mark]ir`.
- It holds the app's two global instruments: the **AMBIENT** toggle (top-right) and, beneath it, the **sound** control. Inner rooms hand that corner to the live chip.
- The quiet note trigger tucks under the status readout.

### 17.4 Moving between places

| Move | Affordance | Motion |
|---|---|---|
| Room → room | nav pill | crossfade, room colour shifts, nav stays (§13.4) |
| Room → sheet | tap a card | opacity fade 460ms |
| Sheet → room | ghost "Back to …", scrim tap, back gesture | opacity fade 460ms |
| Sheet → viewer | tap the media | viewer over a warm scrim |
| Viewer → sheet | bottom `close` pill, single tap on a photo, back gesture | fade |
| Anywhere → first room | the home button in the nav | ordinary crossfade. **No replay of the entry.** |

Every non-root view has a visible way back **and** responds to the system back
gesture (push a history entry on open, pop it on close).

The current room is always identifiable from the lit nav pill alone. The document
title follows the room (`App — room`).

### 17.5 Journey principles

- **Nothing blocks.** No modal walls, no forced onboarding carousel, no permission requests on arrival. The app teaches by being legible: one cue where the action is (`tap & hold` under the ball), then no more instructions.
- **Cues live with the thing.** An instruction sits exactly where the gesture happens, in mono, and disappears once used.
- **Cursor coaching is dropped on touch.** No "click to open" hints.
- **Reward the careful.** A few details are not announced: the offset breath, the glint, the note, the grab-able ball, the live chip's morph. Aim for two or three per app.
- **Every flow ends at rest.** After any action the screen returns to a calm, complete state with nothing still asking.

### 17.6 States the journey must cover

| State | Treatment |
|---|---|
| **Loading (first)** | The waiting ball. Never a spinner, never a skeleton shimmer. |
| **Loading (in-app)** | Content area stays as glass; a single mono line blinks slowly (`· · ·` or a word like `gathering`). Media wells show the atmosphere gradient until the image arrives, then fade it in. (PROPOSED) |
| **Empty** | A room with air and one calm line in secondary ink saying what will live here, plus at most one ghost action. No illustration, no exclamation. (PROPOSED) |
| **Error** | In-world, calm, complete sentence, one way forward. See the 404 below. The red is reserved for genuine refusal. |
| **Offline** | The status readout changes to `no signal`. Cached rooms keep working. Actions that need the network say so in one line when tapped; they are not hidden. (PROPOSED) |
| **Opened in Safari, not installed** | One whisper line near the foot: how to add it to the Home Screen. Dismissed for good on tap. (PROPOSED) |
| **Updated** | No toast. A new version takes effect on next launch. (PROPOSED) |
| **Success** | The control settles; the result is simply present. No banner. |

### 17.7 The lost page (AS-BUILT pattern)

A self-contained page with no app bundle, so it always loads. Cream field with
three faint radial washes (lavender, blue, peach); the breathing mark, 64px; a
huge numeral in Sora 300 filled with a dusty-blue-to-lavender gradient at about
50% opacity; a 500-weight line; one sentence; one pill home; a mono readout at the
foot with the blinking dot.

> **404** · *You've drifted off the map.* · The temple only keeps four rooms, and
> this isn't one of them — there's nothing out here but fog. Head back in, plz. ·
> `← return to the temple` · `remake 2.0 · no signal · path not found`

This is the model for every error: where you are, why, one way back, in the
world's voice.

---

## 18. Voice and copy

### 18.1 The Temple voice (CANON)

Quiet, precise, warm. **Shows instead of tells.** Playfulness lives in **word
choice**, never in adjectives. The signature is the lowercase **`plz`**: a soft
ask. Flag any copy that drifts purple, poetic or descriptive.

### 18.2 Two kinds of text

| Kind | Sounds like | Set in | Examples from the site |
|---|---|---|---|
| **System readout** | an instrument reporting | mono, uppercase or lowercase, terse, middle-dot separated | `remake 2.0 · initializing` · `tap & hold` · `dubai · 32° · 15:03` · `ambient · full` · `rec → fol` · `02 — work` · `selected works · 18` · `contact · say hello` · `elsewhere` · `a note …` · `scroll the timeline →` |
| **Human line** | the maker, briefly, once | Sora or Manrope, sentence case | `Hi! I am Pir` · `— visual designer & dev.` · `email me` · `call ↗` · `Back to folio` · `Visit live ↗` |

Almost everything is a readout. The human voice is rare, which is why it lands.

### 18.3 Rules

- **The maker's name is spoken exactly once**, in the first room. Everywhere else, text is environmental. A name plate such as `PIR · REMAKE 2.0` is a project label, styled as a readout, not a second introduction.
- **Lowercase is the default for interface words.** Buttons, triggers, room names.
- **No exclamation-mark marketing.** (The greeting "Hi!" is the single allowed exclamation.)
- **No urgency.** No "now", "hurry", "don't miss", "only X left", "last chance".
- **No counting at the user** in the Temple register (§3.4).
- **Verbs are plain:** email, call, open, close, back, return, rest.
- **Sentences are short and complete.** One idea each.
- **Numbers are honest.** A readout shows real data or it is not shown.
- **Timeline notes may be fragments:** `first vector. first crash. first dawn finish.` · `type, grid, hierarchy — slowly, then all at once.` That rhythm, concrete nouns, no adjectives, is the model for playful copy.

### 18.4 Errors, confirmations, empties

- **Error:** what happened, in the world's terms, plus one way forward. Calm. *"Nothing came back. Try again in a moment, plz."*
- **Refusal** (the one red): complete and polite. *"This can't be undone."* then two pills: the destructive word, and `keep it`.
- **Empty:** one line, present tense. *"Nothing here yet."*
- **Confirmation:** none, usually. The changed state is the confirmation.
- Never blame the user. Never say "oops", "uh-oh", "whoops" or "sorry!".

### 18.5 Voices of other zones (for in-world apps)

| Zone | Voice | Example |
|---|---|---|
| Upper City | serene, assured, faintly euphemistic. Systems that never admit to being systems. | *"Your access reflects your current tier."* |
| FTZ / sanctioned Overlay | terse, complete, polite, merciless. Imperative, all caps. | `CLEARANCE REQUIRED. RETURN TO DESIGNATED ZONE.` |
| Lower City / Divide | pragmatic, abbreviated, hand-made. Humour as survival. | *"quit shadin' me."* |
| Harsh Division | dead type only. Half-legible remnants. | a departure board frozen mid-word |

### 18.6 Observed drift on the live site (do not copy)

Recorded so the app does not inherit it. These are Pir's content calls on the
portfolio, noted once:

- The Contact heading reads **"Pir Husnain."**, a second speaking of the name against rail 12.
- About copy includes *"Let's make something amazing together."* and a `:)`. Both sit outside the voice in §18.1 (a stock phrase; an emoticon).
- The status temperature (`32°`) is a fixed value, not live. A readout should be real.

---

## 19. Sound and haptics

### 19.1 Sound (CANON direction, AS-BUILT implementation)

Temple sound is **near-silence**: room tone, water, a low tonal bed. **No
percussion.** People *tone* rather than sing.

- **Off by default.** One small control turns it on; that control is the master switch.
- **Fully synthesised** with Web Audio. No audio files to load.
- The `AudioContext` is created lazily on the first press of the sound control.

| Sound | Recipe | When |
|---|---|---|
| **Ambient bed** | sines at 55Hz (gain 0.5) and 110Hz (0.34, +3 cents), a triangle at 164.81Hz (0.10, −4 cents), through a 440Hz low-pass (Q 0.6) whose cutoff is swept ±130Hz by a 0.07Hz LFO: a breath. Master fades to **0.05** over 2.6s; fades out in 0.7s. | while sound is on |
| **Thup** | a sine falling 190 → 78Hz in 0.13s, peak gain 0.11, gone in 0.17s | a room settling in |
| **Chime** | sines at 880Hz and 1318.5Hz (second at half level, 40ms late), peak 0.06, 1s decay | a rare reward (the ball's seam opening) |

Everything is quiet enough to be missed. If a sound is noticed as a "UI sound",
it is too loud.

The sound control shows a soft halo invitation for about 14s on first arrival
with the word `sound` beside it, then stops inviting.

### 19.2 Sound across the world

| Zone | Sound |
|---|---|
| **Temple** | near-silence, room tone, water, a low tonal bed. No percussion. |
| **Upper City** | only the hum of systems; leaves in wind; birds in the sky gardens. The hush of wealth. |
| **FTZ** | announcements, scanner chirps, boots on composite, drone rotors. |
| **Lower City** | dense human mid-range: markets, tools, tape hiss, CRT whine, a buzzing tube. |
| **The Divide** | dripping, the hum of stolen power, low voices. |
| **Harsh Division** | wind through structure, water in flooded streets, one distant drone. |
| **Overlay** | UI tones only the wearer hears; hacked states carry brief bursts of signal noise. |

### 19.3 Haptics

An iPhone web app cannot trigger vibration (§7.7). **Do not design any feedback
that depends on haptics.** Touch is confirmed by the squash, the shadow and the
terracotta bloom under the finger. Do not ship a haptic workaround without
testing it on the exact iOS version in use.

---

## 20. Accessibility

Calm and accessible are the same goal here. These are requirements, not polish.

- **Semantics first.** Real `<button>`, `<a>`, `<nav>`, `<main>`, `<h1>`–`<h3>`, `<dialog>`-equivalent roles. One `<h1>` per room.
- **Names.** Every icon-only control has an `aria-label`. Decorative marks, glyphs, rings and dots are `aria-hidden="true"`. Images that carry meaning have `alt`; purely atmospheric ones have `alt=""`.
- **State.** `aria-current="page"` on the active nav item; `aria-pressed` on toggles and filter tabs; `aria-modal` on sheets.
- **Focus.** A visible ring (§14.6). Focus moves into a sheet on open and returns to the opener on close. Escape and the back gesture close.
- **Contrast.** Follow §11.7. Whisper ink never carries required information.
- **Text size.** Body copy scales with the user's setting; layouts must survive body text at 130% (the three-zone lock and bottom fade exist for this).
- **Zoom.** Do not disable pinch zoom on the document.
- **Motion.** Honour `prefers-reduced-motion` (§13.6) and provide the AMBIENT switch. No flashing: the fastest blink in the system is 0.7s.
- **Gestures.** Every gesture has a tap alternative: swipe has dots or arrows, hold has the reduced-motion auto-entry, pinch has double-tap.
- **Targets.** 44px (§14.1).
- **Sound** is never the only signal, and is off until asked for.
- **Language.** Set `lang` on `<html>`.

Known gap inherited from the site: keyboard navigation depth is limited. A
plain-DOM app has no excuse; make every control reachable and operable by keyboard.

---

## 21. In-world registers: UI translations

For apps that speak from inside the world. The world defines each zone's palette,
type discipline, motion verb and voice (CANON; non-Temple hex values are **v1,
eye-tunable**). It does not define app components for them. **Everything in the
"UI translation" rows below is PROPOSED.**

Universal rules that hold in every register: no serifs · no pure black or white ·
one red `#B8402E` for denial · neon only where the neon rule allows · negative
space at the zone's temperature · motion returns to rest · Sora, Manrope and
JetBrains Mono remain the three voices, cut differently.

### 21.1 Upper City — *illusion* · glides

| | |
|---|---|
| **Palette** | porcelain `#F5F4F0` · silver `#C9CDD1` · sky `#6E9CC4` · canopy `#7FA084` · limestone `#E3D9C6` · amber `#D9A45C` · slate `#4A5560` |
| **Type** | light weights, wide leading, understated luxury. Signage calm and absolute. |
| **Motion** | long frictionless eases, **nothing under 600ms, no bounce**. Light that responds to movement. |
| **Voice** | serene, euphemistic. |
| **Emptiness means** | luxury. Space is the most expensive thing. |
| **UI translation** | Porcelain field, high-key. Hairline silver rules instead of shadows. Sora 200–300, generous leading. Controls nearly invisible until approached. Perfect symmetry. A refusal is delivered beautifully, in a full polite sentence. One subtle heritage detail (a tactile matte switch) as taste. **Remove the elastic settle**: everything glides. The faint chill is that nothing is accidental. |

### 21.2 Neural Overlay / the Gloss — *dissociation* · quantizes

| | |
|---|---|
| **Palette** (additive, over any zone) | glass `#DDEBF5` · signal `#7FC4C9` · denial `#B8402E` · ghost `#A8A29B` · intrusion `#B85C6E` |
| **Type** | Sora ultralight, floating, translucent. Denials in calm complete sentences. |
| **Motion** | stepped transitions. Sanctioned = silent-smooth. Hacked = rhythmic authored glitch. |
| **Rendering laws (CANON)** | glows softly and additively; **never blooms, never lens-flares, never neon**. Always carries a **tell** that it is not physical: translucency, a scanline cadence, a slight registration offset, or a quantized gradient. Glitch is quantized (steps, not smears), brief, rhythmic; channel splits use zone colours, **never an RGB rainbow**. |
| **UI translation** | *Sanctioned (the Gloss):* the Temple's glass language, cooled to white and pale blue, weightless, with one tell. It is the Temple's design stolen and sold: build it beautiful first, then decide who it refuses. *Restricted (the grey):* the same UI degraded by policy: lower frame rate (`steps()` easing), banded gradients, a watermark pattern, permission walls as polite grey voids. *Denied:* geometry replaced by a flat denial field with one perfect sentence. *Hacked:* sliced type, split channels in zone colours, fragments reassembling. Authored sabotage, never random noise. |
| **The tally** | A diegetic uptime meter may live here. *Capped* and *greyed* are states with consequences. |

### 21.3 Floating Transit Zone — *limbo* · scans

| | |
|---|---|
| **Palette** | metal `#9AA2A8` · white `#EDEFF0` · grey `#6E7378` · warning `#B8402E` · industrial `#C9A54A` · billboard `#6FA8D9` (bright accent: corporate billboards and barrier glow only) |
| **Type** | Sora in **all-caps** institutional wayfinding, high size contrast, imperative. |
| **Motion** | metronomic sweeps, **hard stops, no ease**, mechanical repeat. |
| **Emptiness means** | control. Large voids between checkpoints. |
| **UI translation** | Near-monochrome cold field. Strict symmetric grid. Square or barely-rounded corners (2–4px). No glass, no warmth, no shadow softness: flat panels and 1px rules. Linear easing, fixed-interval scan lines. State words are the gate's three: `CLEAR` · `HOLD` · `RETURN`. Tier and number shown as identity. Red only for actual denial. A lone element in a large void is the composition. |

### 21.4 Lower City — *resilience* · flickers

| | |
|---|---|
| **Palette** | concrete `#5A564F` · lit concrete `#8A8580` · aged plastic `#C9BFA8` · rust `#9A6B52` · CRT amber `#C9A15C` · signal teal `#6E8B8A` · sign rose `#B85C6E` · neon rose `#E0637A` and neon teal `#5FB3B0` (signage tubes only, weathered) |
| **Type** | condensed or stencil cuts of Sora for signage; JetBrains Mono on CRTs (bitmap rendering allowed); hand-painted corrections layered over official type. |
| **Motion** | imperfect loops, jitter within bounds, warm-up delays. Alive but tired. |
| **Emptiness means** | relief. Density framed inside a quiet border. |
| **UI translation** | Dark warm-grey field with one warm light source. Chunky, physical controls: toggles that look like toggles, panels like aged plastic, visible seams. Mono readouts in amber or teal with a faint scanline. A screen takes a beat to warm up. Hand-written annotations over printed labels. Dense but ordered: every layer earns its place, and the whole sits in a calm frame. Warm light for home, cold light for work. **Minimal** cassette futurism, never junkyard. At most one small neon element, flickering, partial. |

### 21.5 The Divide — *refuge* · pulses

| | |
|---|---|
| **Palette** | warm black `#1E1C1A` (never `#000`) · worklight `#D9A45C` · salvage `#5C8B85` · copper `#A86B4A` · neon salvage `#63C4BC` (one stolen, half-working tube; rare, precious) |
| **Type** | Lower City rules, with hand-labelling dominant. |
| **Motion** | a slow warm throb in darkness. Heartbeat register. |
| **Horror register** | suspense, the felt-unseen, the dark past the last bulb. Never spectacle. |
| **UI translation** | The one legitimately dark register. Warm-black field; content appears as **small warm territories of light** inside black distance: an amber pool around each active element, falling off quickly. Mismatched salvaged panels, all alive. Hand-painted labels. A slow amber pulse instead of a breath. The edges of the screen stay dark and unresolved. Togetherness: elements cluster near the light. The warmest cold place in the universe. |

### 21.6 Harsh Division — *aftermath* · stills

| | |
|---|---|
| **Palette** | ash `#7A776F` · bone `#B8B2A4` · overgrowth `#6B7A5C` · flood `#5C6E70` · oxide `#8A5A44` · fog `#C9C7C0` · patrol `#B8402E` |
| **Type** | dead type only: faded wayfinding of the failed city, half-legible. |
| **Motion** | near zero. Wind, dust, water, one sweeping patrol light. |
| **Emptiness means** | absence. |
| **UI translation** | **Almost no UI.** Nothing runs out here. Bleached, shadowless grey field; horizontal composition. Interface elements are remnants: frozen boards, partial words. If the player carries a device, its UI belongs to the zone it came from and is failing. One slow red sweep is the only moving thing. Life intrudes at the margins (a little green), and what it means is never said. |

### 21.7 Crossing zones in one app

- **One zone per screen.** Change zone at a cut and let the palettes collide at the cut. Never crossfade one zone's palette into another's in a single gradient.
- **The motion verb changes with the zone.** Arriving in the Temple from anywhere, motion slows, the meter and HUD strip away, and the screen empties. That contrast is the product.
- The signature pair may cameo anywhere as the mark's colours.

---

## 22. Performance rules

The calm depends on the frame rate. Each rule below was learned by breaking it.

| Rule | Why |
|---|---|
| Animate **`transform` and `opacity` only**. | Animating `border-width`, `filter`, `width` or `top` caused layout and re-raster on the exact frame the room revealed. |
| **Never animate `filter: blur()`.** | It re-rasters every frame. Use a radial gradient for softness. |
| **Author large effects at final size** and scale up from near zero. | A small filtered layer magnified 15× is re-rastered repeatedly as it grows. |
| **No `backdrop-filter` on anything that moves, fades or scrolls.** Bake the frost. | A live blur re-samples every frame. |
| **No blend modes over large areas.** | They force a blend group over the whole surface on every frame. |
| **`will-change` only while animating.** Remove it after. | A standing `will-change` pins permanent compositor layers and taxes every scroll. |
| **A masked scroller gets its own layer:** `transform: translateZ(0); contain: paint;` | Otherwise each scroll tick repaints the whole surface. |
| **One layer, not many, inside an animating parent.** | Independently promoted children flicker on iOS when an ancestor recomposites. |
| **No transform on a sheet over live content on iOS.** Opacity only. | Scale re-rasterised the sheet's text every frame: visible shimmer. |
| **`opacity < 1` and `filter` flatten 3D.** | They silently cancel any `translateZ` inside. |
| **Shadows are static.** | Per-frame shadow re-raster. |
| **Nothing animates at rest inside a list.** | Twelve drifting thumbnails were a standing scroll cost. |
| **Media rests.** No autoplay, one clip at a time. | Every mounted clip decoding at once was the lag. |
| **If nothing moved, write nothing.** Stop `requestAnimationFrame` loops when settled; restart on input. | Idle screens must be free. |
| **Defer the non-essential by a frame or two** at big moments. | Splitting one large mount off the reveal frame removed the worst hitch. |
| **Mount content once.** | A double mount behind the entry caused flicker. |
| **Pre-warm heavy things under cover.** | Compile or decode while the entry ball is still on screen, not at the reveal. |
| **Self-host fonts and images.** Thumbnails for lists. | No third-party waits; lists stay light. |
| **Battery is a design constraint.** No heavy shader on a phone. | The site's heart shader is never even downloaded on a phone. |

---

## 23. Engineering rules for a plain HTML / CSS / JS build

### 23.1 Suggested structure

```
/
├─ index.html              the one document
├─ 404.html                in-world lost page, self-contained
├─ manifest.webmanifest
├─ sw.js                   service worker (cache the shell, fonts, icons)
├─ .nojekyll
├─ css/
│  ├─ tokens.css           every token, nothing else (§24)
│  ├─ base.css             reset, type, room, grain
│  ├─ components.css       §16
│  └─ motion.css           every @keyframes, the reduced-motion block
├─ js/
│  ├─ main.js              boot order
│  ├─ state.js             room, ambient, sound; persisted
│  ├─ entry.js             the setting-down
│  ├─ nav.js               room changes, history
│  ├─ atmosphere.js        room colour, hour tint
│  └─ audio.js             lazy Web Audio
├─ data/                   content as JSON, separate from code
├─ fonts/                  six woff2 files
└─ icons/
```

The portfolio keeps **its words in one data file and its design numbers in
another**, apart from code, with every dial's fallback equal to the shipped
value. Keep that split: content is data, tokens are CSS, and a missing value
renders the default look.

### 23.2 Rules

- **Tokens at the top.** Every colour, duration, easing, spacing, radius and z-value is a CSS custom property in `tokens.css` or a named constant at the top of its JS file. These are the design hand-off tokens.
- **No build step required.** ES modules via `<script type="module">`. Relative paths only.
- **State lives on `<html>` as data attributes** so CSS can respond without JS: `data-room`, `data-ambient`, `data-sound`, `data-entered`.
- **One source of truth for any environment decision** (standalone or not, reduced motion, online). Compute it in one module; everything else reads it.
- **JS owns a property or CSS owns it, never both.** If JS animates `scale`, no CSS transition lists `scale`. Use the individual `translate`, `scale` and `rotate` properties so separate concerns compose instead of overwriting one `transform`.
- **Timing by transitions for state, keyframes for one-shots.** Commit the hidden state, then flip on the next frame (double `requestAnimationFrame`) so the transition has a frame to start from.
- **Every animation has a non-animated end state** that is correct on its own.
- **Service worker:** cache the shell and fonts; version the cache name; never trap the user on a stale shell without a path to update.
- **Persist on change**, not on exit.
- **No external requests** needed to render the first room. No analytics beacons, no CDN fonts.
- **Lint and format** consistently; keep a short `README` with the run and deploy steps.

---

## 24. Token sheet (paste-ready)

Temple register, phone. Values are AS-BUILT unless marked.

```css
:root {
  /* ---- field & atmosphere ---- */
  --c-cream:       #F2EBE0;
  --c-cream-deep:  #ECE3D4;
  --c-peach:       #F4C9A8;
  --c-coral:       #E89B7D;
  --c-lavender:    #C9B8DD;
  --c-mint:        #C5D9C8;
  --c-paleblue:    #B4C9D9;

  /* ---- signature pair (locked) ---- */
  --a-terra:       #C77B5C;
  --a-terra-hi:    #E0A284;
  --a-blue:        #7A98B3;

  /* ---- the one red: denial only ---- */
  --a-denial:      #B8402E;

  /* ---- ink ---- */
  --t-primary:     #2A2520;
  --t-secondary:   #6B6560;
  --t-whisper:     #A8A29B;
  --t-on-terra:    #FFF9F2;
  --t-cue:         #637C92;

  /* ---- rooms (fog grades) ---- */
  --room-warm:     #E8C7B0;
  --room-aqua:     #E7EEEF;
  --room-lilac:    #EBE7F1;
  --room-sand:     #EFE1D1;
  /* hour tints, blended 18% */
  --hour-dawn:     #E9ECEA;
  --hour-day:      #F3EEE3;
  --hour-golden:   #F5E3C8;
  --hour-night:    #DDE0E8;
  --hour-blend:    0.18;

  /* ---- glass ---- */
  --g-surface:     rgba(255, 255, 255, 0.12);
  --g-pill:        rgba(255, 253, 250, 0.38);
  --g-pill-idle:   rgba(255, 253, 250, 0.28);
  --g-card:        rgba(255, 253, 249, 0.50);
  --g-cell:        rgba(255, 253, 250, 0.45);
  --g-tag:         rgba(255, 253, 250, 0.85);
  --g-selected:    #EFEEEB;
  --g-sheet-veil:  0.95;
  --g-edge:        rgba(255, 255, 255, 0.65);
  --g-edge-card:   rgba(255, 255, 255, 0.50);
  --g-hair:        rgba(60, 50, 40, 0.10);
  --g-hair-soft:   rgba(60, 50, 40, 0.06);
  --g-blur:        blur(18px) saturate(150%);
  --scrim-light:   rgba(233, 229, 241, 0.50);
  --scrim-note:    rgba(246, 239, 226, 0.66);
  --scrim-deep:    rgba(26, 22, 18, 0.94);

  /* ---- shadows ---- */
  --sh-lip:      inset 0 1px 0 rgba(255,255,255,0.9);
  --sh-card:     inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 1px rgba(40,30,20,0.04), 0 20px 40px -16px rgba(40,30,20,0.12);
  --sh-pill:     inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(40,30,20,0.06), 0 12px 28px -12px rgba(40,30,20,0.22);
  --sh-nav:      inset 0 1px 0 rgba(255,255,255,0.9), 0 22px 44px -14px rgba(40,30,20,0.40);
  --sh-soft:     0 12px 28px -8px rgba(40,30,20,0.32);
  --sh-selected: 0 10px 22px -8px rgba(199,123,92,0.55), inset 0 1px 0 rgba(255,255,255,0.5);
  --sh-band:     inset 0 1px 0 rgba(255,255,255,0.85), inset 0 18px 26px -18px rgba(42,32,22,0.32);

  /* ---- radii ---- */
  --r-pill: 999px; --r-capsule: 24px; --r-card: 20px; --r-photo: 18px;
  --r-thumb: 14px; --r-cell: 12px; --r-focus: 4px;

  /* ---- spacing ---- */
  --sp-1: 4px;  --sp-2: 6px;  --sp-3: 10px; --sp-4: 14px; --sp-5: 16px;
  --sp-6: 22px; --sp-7: 32px; --sp-8: 48px; --sp-9: 64px; --sp-nav: 118px;

  /* ---- layout ---- */
  --safe-t: env(safe-area-inset-top, 0px);
  --safe-b: env(safe-area-inset-bottom, 0px);
  --col-max: 430px;                 /* PROPOSED */
  --gutter: 16px;
  --edge-inset: 32px;
  --rank-top: 28px;
  --rank-top-2: 56px;
  --nav-bottom: 26px;
  --nav-width: 64%;
  --nav-h: 34px;
  --btn: 34px;
  --hit-min: 44px;                  /* PROPOSED */
  --card-w: 78%;
  --card-pad: 14px;
  --card-gap: 22px;
  --thumb-aspect: 16 / 12;
  --measure: 46ch;
  --measure-note: 26ch;
  --sheet-inset: 14px;
  --sheet-band: min(54%, 430px);
  --sheet-blurb-min: 120px;
  --fade: 150px;
  --fade-more: 40px;
  --spine-x: 26px;
  --tl-gap: 48px;
  --tl-text-max: 440px;

  /* ---- z ---- */
  --z-world: 0; --z-slab: 10; --z-content: 20; --z-nav: 30;
  --z-scrim: 79; --z-modal: 80; --z-viewer: 120;

  /* ---- type ---- */
  --font-display: 'Sora', system-ui, sans-serif;
  --font-body:    'Manrope', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;
  --fs-hero: 52px; --fs-hero-lead: 36px; --fs-hero-sub: 26px;
  --fs-room: 40px; --fs-heading: 28px; --fs-sheet: 24px; --fs-note: 20px;
  --fs-item: 18px; --fs-card: 17px; --fs-sub: 14px;
  --fs-body: 14px; --fs-body-s: 13.5px; --fs-value: 13px;
  --fs-label: 10px; --fs-nav: 10.5px; --fs-tag: 9px; --fs-cue: 11px;
  --fs-input: 16px;
  --lh-body: 1.65; --lh-long: 1.7; --lh-note: 1.45; --lh-tight: 1.05;
  --tr-hero: -0.025em; --tr-head: -0.02em; --tr-card: -0.012em; --tr-display: -0.01em;
  --tr-label: 0.18em; --tr-nav: 0.14em; --tr-tag: 0.16em; --tr-cue: 0.20em; --tr-trigger: 0.22em;
  --fw-light: 300; --fw-body: 400; --fw-head: 500;

  /* ---- motion ---- */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);
  --ease-reveal:  cubic-bezier(0.22, 1, 0.36, 1);
  --ease-exit:    cubic-bezier(0.4, 0, 1, 1);
  --ease-pop:     cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-breath:  cubic-bezier(0.42, 0, 0.58, 1);
  --d-press-in: 90ms;  --d-press-out: 580ms; --d-quick: 260ms; --d-state: 400ms;
  --d-sheet: 460ms;    --d-step: 420ms;
  --d-reveal: 1000ms;  --d-reveal-step: 90ms; --d-reveal-base: 1300ms;
  --d-cross: 1680ms;   --d-chrome-return: 980ms;
  --d-hold: 720ms;     --d-ripple: 1500ms;
  --press-scale: 0.90; --card-press-scale: 0.985;
  --cross-out-scale: 0.98; --cross-in-scale: 1.025;
  --breath-room: 11s;  --beat: 3s;
  --breath-mark-a: 7s; --breath-mark-b: 8s;
  --rec-blink: 3s;     --invite-pulse: 4s;   --sheen: 4.2s;
  --note-hold: 7000ms;
  --alert-guard: 500ms;   /* alert buttons ignore touches for this long after it appears */

  /* ---- gesture ---- */
  --swipe-min: 60px; --tap-slop: 6px; --dbl-ms: 280ms;
  --zoom-max: 4; --zoom-dbl: 2.5;
}
```

---

## 25. Pre-ship checklists

Fill and attach. "N/A, because …" is a valid answer; blank is not.

### 25.1 Universal

- [ ] Positioning Header present (zone and both dials)
- [ ] Only the zone's tokens used; no invented colours
- [ ] No pure `#000` or `#FFF`; no serifs
- [ ] `#B8402E` only for denial; terracotta never a warning
- [ ] Neon rule respected for the zone
- [ ] Negative space at the zone's temperature; nothing is full
- [ ] Every element has a function you can state in one sentence
- [ ] Voice matches the zone; no exclamation marketing; no urgency
- [ ] The maker's name appears once
- [ ] Canon table not contradicted; the Earth-outside question untouched
- [ ] Anything invented is flagged `PROPOSED — NOT CANON`

### 25.2 Screen

- [ ] One statement; one axis of alignment
- [ ] About 80% empty (Temple)
- [ ] The room has its own air and reads as a colour
- [ ] One living element, no more than needed
- [ ] Hierarchy by voice and ink before size; no bold for emphasis
- [ ] At most one filled action per cluster
- [ ] Content clears the readout rank, the nav row and both safe areas
- [ ] No hard clip: scrollers fade into the glass
- [ ] Empty, loading, error and offline states designed

### 25.3 Motion

- [ ] Uses the zone's verb and **returns to rest**
- [ ] Nothing autoplays or loops for attention; invitations stop
- [ ] Only `transform` and `opacity` animate; no animated blur
- [ ] No two loops share a period
- [ ] Nothing breathes under a finger
- [ ] AMBIENT off freezes all ambient motion, still visible
- [ ] Reduced motion calms the big moves and keeps content reachable
- [ ] Layout never reflows for an animation

### 25.4 Interaction and accessibility

- [ ] Hit areas ≥ 44px
- [ ] Every gesture has a tap alternative
- [ ] One gesture, one surface
- [ ] Every non-root view has a visible way back and answers the back gesture
- [ ] Semantic elements, labels, `aria-current` / `aria-pressed` / `aria-modal`
- [ ] Focus ring visible; focus enters and leaves sheets correctly
- [ ] Required text is not in whisper ink; body ≥ 4.5:1
- [ ] Layout survives enlarged text
- [ ] Sound off by default and never the only signal

### 25.5 Platform

- [ ] All paths relative; works under `/<repo>/`
- [ ] `.nojekyll` present; in-world `404.html` present
- [ ] Manifest, 180px opaque touch icon, `theme-color`, status bar style `default`
- [ ] `viewport-fit=cover` and both safe-area insets handled
- [ ] `--app-h` used; the document never scrolls; no rubber-band
- [ ] Hold surfaces unselectable and callout-free
- [ ] Inputs at 16px
- [ ] No reliance on haptics, hover, or background execution
- [ ] First room renders with no network
- [ ] **Verified on a real iPhone, launched from the Home Screen**

---

## 26. Extending the system

- **Tune freely (and log it):** timings and intensities within a zone's verb; v1 zone hex values; spacing within the scale; copy in street and institutional registers.
- **Only Pir decides:** the laws, the hard rails, the canon table, master token values (the Temple palette, the signature pair), the universe's name, anything touching the Temple's emotional brief, the Earth-outside question, and the portfolio's locked values (slab radius 147px, page order, particle budgets, fog saturation, pointer drift).
- **How canon grows:** draft the addition in the zone structure used in §21 → check it against the laws (an extension that needs to break a law is a redesign, not an extension) → Pir approves → this manual is amended, versioned and dated.
- **Triage for "is this off-brand?"**, in order, stop at the first hit:
  1. A hard rail is broken → off-brand; cite the rail.
  2. Wrong dial position → reposition.
  3. Right rules, wrong feel → tuning call: adjust tokens and timings, do not redesign.
  4. Rules followed, still feels new → it may be a real extension: write it up as `PROPOSED — NOT CANON` and ask.

---

## 27. Register of PROPOSED items and open decisions

Everything in this manual that the source material did not specify. None of it is
canon until Pir says so.

| # | Item | Where | Why it was needed |
|---|---|---|---|
| 1 | Fluid column with `max-width: 430px` instead of the site's scaled design box | §8.1 | A plain HTML app has no stage scaler |
| 2 | 44px minimum hit area | §14.1 | The site's 34px targets are tight for daily use |
| 3 | Legibility floor: required text ≥ 11px in secondary ink | §10.4 | 9px whisper labels fail contrast and size for functional text |
| 4 | Shortened waiting beat on repeat launches, hold kept | §17.2 | A 5.2s wait suits a one-time visit, not a daily app |
| 5 | Text input component | §16.12 | The site has no forms |
| 6 | Disabled and loading control states | §14.6 | Never needed on the site |
| 7 | Empty, in-app loading, offline, not-installed and updated states | §17.6 | Never needed on the site |
| 8 | No status-green; success is a settle | §11.4 | The palette has no success colour; this keeps it that way on purpose |
| 9 | The red hour as a fifth hour band | §11.6 | Part of the world, not yet built |
| 10 | Room grades for any room beyond the site's four | §11.3 | New rooms need new air |
| 11 | All UI translations for non-Temple zones | §21 | The world defines each zone's look, not app components |
| 12 | File structure and state-on-`<html>` conventions | §23 | Stack-specific |

**Vytls:** its own proposed items and open decisions are in §28.12.

**Open questions for Pir when any further app brief arrives:** what the app is and who
speaks (sets the zone) · the rooms and their fixed order · which living elements
it carries · whether the tally exists in it · whether it needs any input, account
or network at all.

---

## 28. Applied: Vytls

*The first app built with this system. This section is the design authority for
Vytls. On look, feel, motion, wording and screen structure, this section wins.*

```
ZONE:    Safe Haven / Temple. An in-world instrument: a vital-signs log kept
         by someone living in the sanctuary.
DIAL 1:  quietest. Soft technology that serves and never demands.
DIAL 2:  1. No visible hardware; the instrument is glass and light.
```

**The concept, roughly:** one person keeps a daily record of a few body readings
and a few counted movement sessions, sees the month, hands a report to her
doctor, and is told plainly when to call. Exact numbers and limits are hers to
set in the app; this manual fixes how everything looks, moves and reads.

Everything in §28 is **PROPOSED** until Pir approves it.

### 28.1 The fiction

Vytls is an object from inside the world: the kind of instrument the Safe Haven
would make for one of its own. On the portfolio, the corner of the glass carries
"the building's pulse-ox monitor", a heartbeat and a breath. Vytls is that idea
turned toward a person: **the sanctuary's vital log.**

- It behaves like Temple technology: present, important, nearly invisible. The
  world's own phrase for it: *AI serves rather than controls*.
- The Temple is off the meter: nobody's hours are counted there. Vytls does not
  break that. The world's meter sells time; this instrument **listens to a body
  and keeps a record.** It never rations, scores or ranks.
- The fiction is carried by look, motion and voice only. **The app never explains
  the world**, names Mars, or tells a story. No new canon is created by it.
- It is used by a real person for real readings. Wherever the fiction and plain
  understanding pull apart, **plain understanding wins**, and nowhere more than
  on the alert (§28.9).

### 28.2 What carries over unchanged

Vytls is the Temple register as built. It uses sections 5–20 **as written**:

- the palette, the room colours, the hour tint, light only (§11);
- glass, grain, warm shadows, edge fades, radii (§12);
- the three typefaces and the type scale, with the legibility floor (§10);
- **the portfolio's motion, at the portfolio's pace**: the long glass crossfade
  between rooms, the staggered item settle, the boot cascade, the elastic press
  (§13). There is no faster "utility" variant.
- the nav capsule with three-letter codes and the terracotta selected state (§16.2);
- the AMBIENT switch, the status readout, the quiet note, the live chip (§16);
- optional synthesised sound, off until asked for (§19);
- the phone layout bands, spacing scale and alignment rules (§8).

Only the items below are specific to Vytls.

### 28.3 Rooms

Four rooms, in this fixed order, plus three views that take the whole screen.

| Room | Nav | Air | What it holds |
|---|---|---|---|
| **today** | home button | warm `#E8C7B0` | The day's lifeline (§28.5) |
| **history** | `HIS` | lilac `#EBE7F1` | The month, day by day |
| **report** | `REP` | aqua `#E7EEEF` | The page for the doctor; backup |
| **settings** | `SET` | sand `#EFE1D1` | Her numbers, the doctor's number, AMBIENT, sound |

Full-screen views: the **movement counter** (§28.6), the **alert** (§28.9), and
the **add-to-Home-Screen** page shown when the app is opened in a browser tab.

The status readout (top-left) reports real things only, in the readout voice:
the time glyph, then for example `day 12 of 30 · 14:32`.

### 28.4 Arrival: the ball as the loader

The ball is kept, as **the loading animation at launch**. It is not tied to a
press-and-hold; the app opens by itself.

```
1  FIELD     Cream field, faint grain.
2  WAITING   The ball floats at centre, rocking on its base (-7 to +7 degrees,
             850 ms a swing), its centre button glinting once per swing.
             Whisper label beneath: VYTLS · INITIALIZING
             It is the real loader: it waits for fonts and saved data.
3  CATCH     When ready (and after a minimum graceful beat of about 1.2-1.5 s,
             so a fast load never flashes), the ball pops: the catch.
4  RIPPLE    The liquid ripple opens from centre: three soft rings, 1.5 s.
5  BOOT      The room assembles under the rings in the boot cascade (§13.4):
             centre glow, then the lifeline's words, then the nav, then the
             ambient layers last.
```

- Timings after the catch: ripple at 430ms, room mounts at 820ms, overlay clears at 1760ms (§17.2).
- No skip button, no separate spinner. The ripple plays over an empty surface and the room mounts once.
- It plays once per launch. Moving between rooms never replays it.
- Reduced motion: the ball appears still, then the room fades in.
- **One exception:** if an alert is owed, the alert is painted first, before the ball.

### 28.5 Today: the day as a lifeline

The portfolio's strongest phone moment is the vertical timeline with the ball
walking its spine (§16.9). In Vytls that **is** the Today screen. The day is a
lifeline, and each thing to log is a node on it.

- **Spine:** a dusty-blue line down the left (x = 26px). The part of the day
  already logged is **charged** (lit); the part ahead is dim.
- **Nodes:** one per entry, in time order, 48px apart. Each node has a `label`
  (its name and due time in mono), an `item-title`, and, once logged, its value.
- **The ball docks at the next node to log.** When she logs it, the ball
  detaches with squash and stretch, arcs to the next node and snaps in with a
  soft wobble; a pulse runs down the spine and the next node pre-lights. *Ball =
  heart, snap = muscle, pulse = blood.*
- The scroller settles so the docked node rests on the focus line (30% down).
  Entries far from focus fade toward their floor, so one thing is read at a time.
- Tapping a node opens its **sheet** (§16.7) to enter or edit. A reading is typed
  into one large field: Sora 300, 44px, tabular, with its unit beside it, the
  number pad open, and the save action held above the keyboard.
- A meal's entries are grouped under one heading on the spine; its steps are
  consecutive nodes.
- At the top, in the readout voice: `3 of 7 logged`. It reports and does nothing else.
- When the day is complete the ball rests on the pendant mark at the foot of the
  spine, the whole line charged. One quiet line may sit beneath it: `rest.`
- A permanent, clearly visible control to raise the alert herself sits pinned
  above the nav (§28.9).

### 28.6 The movement counter: a pulse relay

Full screen, nav hidden. The same body language as the lifeline, turned sideways.

- A short **spine with one node per movement to count** runs across the upper
  third. The ball waits at its start.
- Below it, the count in Sora 300 at 64px (`3 of 5`) and the elapsed time in
  mono, tabular, always worked out from the start time.
- The lower two-thirds is **one glass surface to tap**, radius 28px, labelled in
  Sora 24px. It is the only large thing on the screen.
- **Each tap:** the surface dips and settles with the elastic press; a terracotta
  bloom opens under the finger; the ball hops to the next node with its squash,
  arc and wobble; a pulse runs the spine and the node lights.
- An outlined pill directly under the surface undoes the last tap; the ball hops
  back. A second outlined pill at the top ends the session early, out of the
  thumb's way.
- **Completion.** On the last node the ball's seam opens with a soft bloom of
  palette light (the portfolio's own reward for a careful visitor) and, if sound
  is on, the two-note chime. The spine stays fully lit, the count becomes the
  result (`5 of 5 · 23 min`), and one filled action closes the screen. One
  bloom, then rest. No confetti, no praise in words (§28.11).
- The alert control from Today is also present here, at the foot.

### 28.7 The vital motifs: heartbeat and breath

Vytls carries both of the portfolio's vital signs. They are the instrument's
own signs of life.

| Motif | Colour | Rhythm | Where it lives |
|---|---|---|---|
| **Heartbeat** | terracotta `#C77B5C` | every 3s, a double bloom: lub 0.13s up, 0.20s down; dub 0.11s up, 0.30s down; then rest | the docked ball's centre button; a faint vein web rooted in the bottom-right corner behind the content; the live dot |
| **Breath** | dusty blue `#7A98B3` | about 11s: a glow wells up, holds, drains | the spine's charged length; the same corner web; the room's air |

- **The corner web** is the phone form of the portfolio's circulatory corner: a
  few branching capillary lines, drawn as inline SVG, dissolving into the glass
  through a soft radial fade. No outline, no silhouette. Overall opacity capped
  low (the portfolio's ceilings: web 0.50, terracotta wash 0.28, arterial strokes
  0.40). No shader on a phone.
- Heartbeat and breath run on different clocks and never lock together.
- **The pulse belongs to the instrument and the room.** It never sits beside a
  reading or a count as if it were a measurement of anyone, and it is never
  labelled.
- Both obey AMBIENT (off = frozen at rest, still visible) and both are still on
  the alert screen.
- Scroll-driven and tap-driven pulses (the ball's snap, the spine relay) are
  responses, not ambient: they always play.

### 28.8 The colours of state

The brand's own colours, each given one job in Vytls. All fills carry dark ink
`#2A2520`; each state also carries a mark and a word, so colour is never the
only signal.

| State | Colour | Source in the brand | Appears as |
|---|---|---|---|
| **Settled** (logged; within her set range; goal reached) | mint `#C5D9C8` fill; forest `#5A7A5A` for the check mark | Temple palette; the mark's colour population | a soft mint tint on the node and its value chip, a forest check |
| **Above her set range** | amber `#D9913F` fill | the low-sun colour of the status glyph | a filled chip with a ▲ and the word |
| **Alert** | the one red `#B8402E`, text `#FFF9F2` | universe-wide denial and warning | the alert screen, the control that opens it, a passed-window node |
| **Next / selected** | terracotta gradient `#E0A284 → #C77B5C` | the signature pair | the active nav pill, the docked ball, the touch bloom |
| **Lifeline / progress / focus** | dusty blue `#7A98B3` | the signature pair | the spine, its pulse, the focus ring |
| **Not logged** | no fill, hairline | — | an unlit node and a dash |

Mint is too pale to be text: it is only ever a fill or a tint, with forest green
for small marks (forest on cream is about 4:1, enough for a mark, not for body
text). Amber, terracotta and red are told apart by more than hue: amber is a
small filled chip with a ▲, terracotta is the selected pill and the ball, and red
is a solid field with cream text.

### 28.9 The alert

The single place the instrument stops being quiet. It is the universe's one red
used for exactly what it means.

- Solid `#B8402E` from edge to edge, including under the status bar. No glass, no
  grain, no blur, no room colour, no ambient motion.
- **It appears at once**, above everything, with no transition, and before the
  loading ball if it is owed at launch.
- Text in `#FFF9F2`. The headline is a plain instruction in Sora 500 at 28px,
  left-aligned in the upper half, with one supporting line in Manrope 18px
  beneath. **The world's voice steps aside here**: no readout styling, no
  lowercase play, no `plz`. The final words are Pir's to set.
- One primary action, a cream pill across the full width, 64px tall, dark text at
  18px with a phone mark, in the lower half. **Its label is always `Call doctor`.**
- A separate, clearly smaller outlined pill closes the screen, set at least 32px
  away from the call action so the two are never confused.
- Nothing else is on the screen.
- **Tap guard.** For the first **500ms** after the alert appears, its buttons
  ignore every touch. The alert can arrive while her thumb is already coming
  down on the counter's tap surface; without the guard that tap could land on
  the close pill and dismiss the alert unseen, or on the call action and dial by
  accident. The screen still appears at once and looks fully ready; only the
  response is held. A touch that began before the alert appeared never counts,
  even if the finger lifts after the 500ms. Token: `--alert-guard: 500ms`.
- The control that raises the alert by hand (on Today and on the counter) is a
  full-width outlined pill in the same red with a mark and plain words, 52px
  tall. It is never collapsed into a menu.

### 28.10 History and report

**History.** One row per day in a glass panel, the whole row tappable, opening
that day's lifeline as a sheet. Each day shows its entries as a small run of
cells: values in mono 13px, tabular, tinted by state (§28.8) with their marks.
Column headings stay pinned. Today's row carries a dusty-blue line at its left
edge. The panel fades at top and bottom (§12.6). A dense grid cannot be 80%
empty; give it a quiet frame of air instead (Law 8).

**Report.** The brand's document register: ink text, mono for every
number and for metadata, one idea per block, generous margins. For print it sits
on white with no glass, shadows or room colour, and every state is printed as a
mark and a word, because a printer may drop colour.

### 28.11 Voice

Temple voice (§18): quiet, precise, warm. Readouts in mono; the human voice rare.

- Readouts: `vytls · initializing` · `day 12 of 30 · 14:32` · `3 of 7 logged` · `due 14:30` · `5 of 5 · 23 min` · `not logged`.
- Actions are plain and lowercase: `save`, `start counting`, `undo last tap`, `back up`.
- The instrument **states; it does not praise or scold.** No "great", "well done",
  "missed", "too high". A settled entry shows its value, its mark and its tint.
- One `plz` is allowed in the whole app, on something low-stakes (the backup
  line, the lost page). Never near a reading, a count or the alert.
- The maker's name, if it appears at all, appears once, in Settings.

### 28.12 Open items for Pir

| # | Item | Note |
|---|---|---|
| 1 | The in-world framing (§28.1) | My proposal, built only from existing canon. Rename or reframe freely. |
| 2 | Nav codes `HIS` · `REP` · `SET` | Follows the portfolio's three-letter rule. Full words are the fallback if they read unclear in use. |
| 3 | Amber `#D9913F` and forest `#5A7A5A` as state colours | Both already exist in the portfolio; using them for state is new. |
| 4 | The completion bloom (§28.6) | Reuses the ball's seam bloom and chime. Say if you want more, or nothing. |
| 5 | Alert headline and supporting line | Yours to write. The design holds the space for one instruction and one line. |
| 6 | Tap guard on the alert (§28.9) | **Approved by Pir.** 500ms; lengthen it if accidental taps still get through on the phone. |

---

## Appendix — Glossary

- **Temple register** — the brand's own voice and visual system: cream field, the signature pair, breathing motion, about 80% negative space.
- **The dials** — Dial 1 tech-saturation (loud ↔ quiet); Dial 2 cassette futurism (0–10). Set both before designing.
- **Cassette futurism** — retro-analogue future tech: CRTs, tape, chunky plastic, physical switches. A dial, not a universal style.
- **The slab** — the sheet of frosted glass the interface sits on. On the phone it is the whole screen.
- **Room** — one peer screen with its own air colour.
- **Readout** — instrument-style text in mono. Most text in the product.
- **Whisper** — the quietest ink and the metadata layer it carries.
- **The signature pair** — terracotta (heartbeat) and dusty blue (respiration).
- **The one red** — `#B8402E`. Denial only.
- **Setting-down** — the press-and-hold entry; stopping the count to come in.
- **The tally / uptime** — the world's metered hours of light or Gloss. The Temple is off the meter.
- **The Overlay / the Gloss** — the AR and VR layer over reality; its premium tier.
- **AMBIENT** — the user's master switch for all ambient motion.
- **Different lungs** — two parts of one thing breathing on offset clocks.
- **Return to rest** — the universal motion law. No permanent motion states.
- **Baked frost** — a milky solid fill used instead of a live blur on anything that moves.
- **Three-zone lock** — a fixed column of pinned head, flexible middle and pinned foot, so positions hold across items.
- **PROPOSED — NOT CANON** — the mandatory flag on anything invented.
- **Regression / never-built / working-but-off / working-but-ugly** — the four review verdicts.
- **Change nothing else** — the safety valve on every edit.
