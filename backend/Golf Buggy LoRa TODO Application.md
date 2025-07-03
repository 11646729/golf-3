# Gulf Buggy LoRa Software & Hardware

## Overall Specifications - Random List

- [ ] LoRa Tx / Rx installed in each buggy
- [ ] Buggy map in single location (Professional's shop) but capable of multiple locations
- [ ] Information on who has hired which buggy
- [ ] Each buggy has a unique number
- [ ] Type of hire e.g. 9, 13 or 18 holes or long term hire e.g. Terry, Andrew or Nicky
- [ ] Register time left 1st Tee
- [ ] Estimate time back
- [ ] Underhire e.g. Hired for 9 holes, used for 18 holes - How much they paid vs. How much they used
- [ ] GPS Position of every flag every day
- [ ] Golf Course weather sensor (At Clubhouse ?)
- [ ] Autonomous golf scoring, buggy location & emergency assistance system
- [ ] Enter scores into tablet on buggy, transmit to clubhouse & other buggies.
- [ ] Map showing buggy locations
- [ ] Map showing buggy status e.g. battery status, user reported faults, available, faulty etc
- [ ] Emergency message passing ?
- [ ] Speed up play with an audio alert

## Map Specifications

- [ ] Course Name e.g. 5 options
- [ ] Maximum Number of Buggies e.g. 99
- [ ] Zoom into a buggy or a hole

## Golf ball locator using range finder

- [ ] After hitting a ball into a hazard, use the Range Finder to mark/flag where the ball went into the hazard.
      e.g. If a ball is hit into a bush, mark it’s location on the viewfinder screen & save it’s coordinates in memory. Use device as a proximity sensor (perhaps higher or lower tone or volume) when searching for the ball. Use in conjunction with the “golf torch” by transmitting the coordinates to an iPhone rather than Range Finder to allow search in low light (e.g. at dusk)

### Refactoring

- [ ] add client sent package side validation
- [ ] setup a vitest.config.ts file in the test directory so that absolute imports don't break everything

### Sounds

- [ ] before playing a new sound, determine distance from player and reduce volume if the sound was far away
- [ ] auto clean up sound entities after 5 seconds.

### Map Generation

- [ ] create a "farm" zone which has a small farm building, a tractor, and trees
- [ ] create a "city" zone which has a building and roads
- [ ] create a "road" zone which is used to connect cities and farms (road going up or down)
- [ ] generate larger maps containing farms, cities, and roads that connect them.

## Change Log:

- [x] 1/4/2025: a player shouldn't be colliding with a dead zombie
- [x] 1/4/2025: fix bullet from coming out of players head
