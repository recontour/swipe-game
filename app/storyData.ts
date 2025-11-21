export type CulpritProfile = {
  violent: number; // 0-3: Tendency for brute force vs precision
  organized: number; // 0-3: Planning capability vs chaotic/impulsive
  personalMotive: number; // 0-3: Crime of passion/revenge vs impersonal
  financialMotive: number; // 0-3: Greed/debt vs other reasons
  insideJob: number; // 0-3: Access to restricted info/areas vs outsider
};

export type Effect = {
  timeCost?: number; // minutes advanced by this choice
  focusDelta?: number; // negative = mental fatigue, positive = regained clarity
  culpritProfileDelta?: Partial<CulpritProfile>; // traits inferred from this clue
  suspicionDelta?: Record<string, number>; // bias towards suspects by id
};

export type Choice = {
  text: string; // Label under left/right
  nextId: string; // Target node ID
  effect?: Effect; // Consequences of this specific choice
};

export type StoryNode = {
  id: string;
  text: string; // ~600 chars max, noir tone
  image: string; // Emoji reference
  timeCost?: number; // Base time cost for scene
  focusDelta?: number; // Base focus cost for scene
  culpritProfileDelta?: Partial<CulpritProfile>; // Inference from scene context
  suspicionDelta?: Record<string, number>; // Base suspicion changes
  left: Choice;
  right: Choice;
};

export type Suspect = {
  id: string;
  name: string;
  traits: CulpritProfile; // The "true" profile if this person is the killer
};

// --- DATA: SUSPECTS ---

export const SUSPECTS: Suspect[] = [
  {
    id: "steel",
    name: "Marcus Steel",
    traits: {
      violent: 1,
      organized: 3,
      personalMotive: 0,
      financialMotive: 3,
      insideJob: 2,
    },
  },
  {
    id: "elena",
    name: "Elena 'The Spider'",
    traits: {
      violent: 1,
      organized: 2,
      personalMotive: 1,
      financialMotive: 3,
      insideJob: 0,
    },
  },
  {
    id: "drake",
    name: "Councilman Drake",
    traits: {
      violent: 0,
      organized: 1,
      personalMotive: 2, // Fear/Blackmail
      financialMotive: 1,
      insideJob: 3, // High access
    },
  },
  {
    id: "joe",
    name: "Homeless Joe",
    traits: {
      violent: 2, // Desperate
      organized: 0,
      personalMotive: 0,
      financialMotive: 3, // Survival
      insideJob: 0,
    },
  },
];

// --- DATA: STORY NODES ---

export const STORY: Record<string, StoryNode> = {
  start: {
    id: "start",
    text: "The fire at the Municipal Archives is out, but the building still exhales smoke like a dying animal. Sprinklers drip onto warped shelves, pages curl into black lace, and somewhere under the stink of burnt paper you can still smell cooked flesh. The night crew is gone; the fire marshal is busy covering his ass. In the center of a collapsed aisle lies what’s left of Clara Hsu, the city’s lead internal auditor, her badge fused to melted polyester. Dawn will bring reporters and bureaus and a dozen hands trampling your evidence. For now, it’s just you, the ashes, and the clock. You wipe soot from your watch face and weigh your options.",
    image: "🔥",
    timeCost: 0,
    focusDelta: 0,
    left: {
      text: "Examine the body",
      nextId: "body_archive",
      effect: { timeCost: 12, focusDelta: -6 },
    },
    right: {
      text: "Walk the floor",
      nextId: "floor_survey",
      effect: { timeCost: 10, focusDelta: -4 },
    },
  },

  body_archive: {
    id: "body_archive",
    text: "You pick your way over sagging metal and glass to what used to be Row C. Clara’s body is a collapsed silhouette among the wreckage, limbs twisted by heat, not struggle. Her hands tell you more than her face: one clenched around charred fabric, the other fused to a warped plastic strip where a keycard used to be. The burn pattern crawls up her sleeves but leaves a clean line at her neck—smoke in the lungs, so she was alive when the fire started, but there’s a darker circle beneath the soot, a bruise or something sharper. Someone bound her or held her down before the flames. The corridor sprinklers here failed first. Convenient, if you knew the layout.",
    image: "🧍‍♀️",
    timeCost: 8,
    focusDelta: -6,
    culpritProfileDelta: { organized: 2, insideJob: 2, violent: 1 },
    suspicionDelta: { drake: 1, steel: 1 },
    left: {
      text: "Check her pockets",
      nextId: "pocket_evidence",
      effect: { timeCost: 6, focusDelta: -3 },
    },
    right: {
      text: "Call in samples",
      nextId: "records_lab",
      effect: {
        timeCost: 10,
        focusDelta: -2,
        culpritProfileDelta: { organized: 1 },
      },
    },
  },

  floor_survey: {
    id: "floor_survey",
    text: "You leave the corpse to cool and let your eyes adjust to the geometry of ruin. Fire chewed a path along a single corridor, then climbed, like it knew exactly which shelves to erase. The rest of the stacks are smudged but intact. Along the main aisle, the linoleum is blistered in a neat arc leading from the records room door to a blown-out emergency exit. Outside, the glass is scattered on the pavement, not inside: someone left in a hurry, not came in. In a shadowed stairwell, you spot a nest of blankets and cans—someone’s unofficial address. Down near the landing, a half-print in wet soot: expensive leather, narrow heel, too clean for city workers or bums.",
    image: "🏚️",
    timeCost: 10,
    focusDelta: -5,
    culpritProfileDelta: { organized: 1, insideJob: 1 },
    suspicionDelta: { joe: 1, steel: 1 },
    left: {
      text: "Follow stairwell",
      nextId: "joe_intro",
      effect: { timeCost: 15, focusDelta: -4 },
    },
    right: {
      text: "Inspect consoles",
      nextId: "security_console",
      effect: { timeCost: 12, focusDelta: -5 },
    },
  },

  pocket_evidence: {
    id: "pocket_evidence",
    text: "You work gently around the brittle fabric. In the lining of Clara’s blazer, the fire has spared a few things. A heat-warped thumb drive clings to a safety pin. A receipt from a riverside bar, The Rusted Swan, timestamped just three hours before the alarms. On the back, in Clara’s cramped, meticulous hand: “Hawk shells on bid list. D. fast-tracked vote. ‘Spider’ has copies.” Below that, a final line, jagged, squeezed into the margin: “If this burns, it wasn’t an accident.” You’ve seen that nickname before. Elena Vostok, the Spider, sells information to anyone who pays. Steel bids on city land. Drake pushes the votes through. Clara was auditing all of them.",
    image: "🧾",
    timeCost: 7,
    focusDelta: -4,
    culpritProfileDelta: {
      financialMotive: 2,
      insideJob: 2,
      personalMotive: 1,
    },
    suspicionDelta: { steel: 2, drake: 2, elena: 2 },
    left: {
      text: "Head to City Hall",
      nextId: "drake_intro",
      effect: { timeCost: 25, focusDelta: -6 },
    },
    right: {
      text: "Go to Steel Tower",
      nextId: "steel_intro",
      effect: { timeCost: 25, focusDelta: -6 },
    },
  },

  records_lab: {
    id: "records_lab",
    text: "You bag what you can: flakes of soot from Clara’s blazer, a smear of oily residue from the floor where the flame pattern starts, a melted sliver of plastic from the busted sprinkler head. The mobile tech van hums outside, its interior lit sickly blue. The on-call chemist owes you three favors and a bottle of bourbon. Ten minutes later, you have a preliminary: the accelerant wasn’t cheap gasoline, but an industrial solvent used in high-rise glazing and municipal tunnel work, sold on contract in bulk. Fibers caught in the melted keycard strap match a high-vis vest, the kind city crews wear to keep from getting killed. Outsider fire, insider access.",
    image: "🧪",
    timeCost: 15,
    focusDelta: -3,
    culpritProfileDelta: { organized: 2, insideJob: 1, financialMotive: 1 },
    suspicionDelta: { steel: 2, drake: 1, joe: 1 },
    left: {
      text: "Trace city contracts",
      nextId: "drake_intro",
      effect: { timeCost: 20, focusDelta: -5 },
    },
    right: {
      text: "Check supplier list",
      nextId: "steel_intro",
      effect: { timeCost: 20, focusDelta: -5 },
    },
  },

  security_console: {
    id: "security_console",
    text: "The security office is a blackened closet of plastic stink. Monitors have sagged into shiny puddles, but the DVR rack at the bottom of the stack died slower; one drive casing is scorched but intact. You pry it loose, thumb away ash, and jack it into your portable viewer. Most footage is static and heat ghosts, but one fragment survives: the records room door, 01:13 A.M. A figure in a hood and safety vest swipes in with a practiced motion. As they turn, the camera catches a profile—sharp jaw, a glint of something like metal at the ear—and a flash of ink along the wrist: a spiderweb curling under a cuff. The audio cuts out on a low, familiar laugh.",
    image: "🎥",
    timeCost: 14,
    focusDelta: -6,
    culpritProfileDelta: { organized: 2, insideJob: 1, violent: 1 },
    suspicionDelta: { elena: 3 },
    left: {
      text: "Track Spider’s bar",
      nextId: "elena_intro",
      effect: { timeCost: 30, focusDelta: -6 },
    },
    right: {
      text: "Recheck accelerant",
      nextId: "records_lab",
      effect: { timeCost: 10, focusDelta: -3 },
    },
  },

  joe_intro: {
    id: "joe_intro",
    text: "Down in the stairwell, below the fire line, you find the nest you saw from above. Blankets, bottles, a shopping cart full of tin cans and city pamphlets. Homeless Joe has upgraded from underpass to warm stairwell; you’ve moved him on from half the tunnels in this district. Tonight he’s hunched in the corner, eyes bright in the emergency light glow. His beard is singed at the tips. “Didn’t touch nothing,” he mutters before you even open your mouth. “Just the smoke. Then the boom. Lady was screaming, then not. I saw a vest, yellow like the sun, and a shiny helmet, like the tunnel crews wear. And a briefcase, black, thrown out the exit like trash.”",
    image: "🧔",
    timeCost: 12,
    focusDelta: -4,
    suspicionDelta: { joe: 1, steel: 1, drake: 1 },
    culpritProfileDelta: { violent: 1, insideJob: 1 },
    left: {
      text: "Calm him down",
      nextId: "joe_secret",
      effect: { timeCost: 10, focusDelta: 4 },
    },
    right: {
      text: "Push harder",
      nextId: "joe_spooked",
      effect: { timeCost: 5, focusDelta: -8 },
    },
  },

  joe_secret: {
    id: "joe_secret",
    text: "You keep your voice low, let Joe ride out the adrenaline. You offer him your coat for a minute; he stares at it like it’s evidence. Slowly, the story unknots. He heard Clara arguing yesterday in the alley with a man whose shoes clicked like money—polished leather, not steel-toe. The man waved a folder, said the word “committee” like a threat. Later, after closing, Joe watched a different visitor slip in a side door: slimmer, moving like someone who’d been in the building often enough to stop reading the signs. “She had that web on her wrist,” he says. “Same as the girl who buys rumors off me. Said tonight would be loud.”",
    image: "🤫",
    timeCost: 10,
    focusDelta: 3,
    suspicionDelta: { drake: 2, elena: 2 },
    culpritProfileDelta: { personalMotive: 1, insideJob: 2 },
    left: {
      text: "Confront Drake",
      nextId: "drake_intro",
      effect: { timeCost: 25, focusDelta: -5 },
    },
    right: {
      text: "Go to Spider",
      nextId: "elena_intro",
      effect: { timeCost: 25, focusDelta: -5 },
    },
  },

  joe_spooked: {
    id: "joe_spooked",
    text: "You crowd him without meaning to, soot still on your coat, badge catching the emergency light. Joe flinches like you slapped him. His words tangle into panic. “Didn’t see faces, didn’t see nothin’. Just fire. Just noise. Just that hawk sign on the folders they were carrying last week. You can’t make me remember more, I’ll forget my own name.” He shoves past you, blanket trailing sparks, and bolts down the stairwell toward the service tunnels. You could chase him, but all you’d catch tonight is more smoke. What he did give you clings like ash: a hawk logo on confidential files being hauled in and out of a public building after hours.",
    image: "🏃",
    timeCost: 8,
    focusDelta: -10,
    suspicionDelta: { steel: 2 },
    culpritProfileDelta: { financialMotive: 1, insideJob: 1 },
    left: {
      text: "Follow Steel’s trail",
      nextId: "steel_intro",
      effect: { timeCost: 25, focusDelta: -4 },
    },
    right: {
      text: "Return to scene",
      nextId: "logic_hub",
      effect: { timeCost: 15, focusDelta: 2 },
    },
  },

  steel_intro: {
    id: "steel_intro",
    text: "Steel Tower cuts the fog like a knife. Marcus Steel greets you in shirtsleeves, city lights reflected in his windows and his teeth. “Hell of a tragedy,” he says, like he’s reading off a press release. “Clara audited everyone equally. If someone lit a match under her, my money’s on a politician with something to lose.” On his desk, under a glass paperweight, sits a char-smudged folder stamped with the same municipal hawk you saw in the archives. Behind him, plans for a redevelopment glimmer on a wall screen, the Archives lot outlined in bright blue. “Fire codes are a nightmare in those old stacks,” he adds. “Sometimes the past burns itself down for you.”",
    image: "🏢",
    timeCost: 20,
    focusDelta: -5,
    culpritProfileDelta: { financialMotive: 2, organized: 1, insideJob: 1 },
    suspicionDelta: { steel: 2 },
    left: {
      text: "Show Clara’s notes",
      nextId: "steel_ledger",
      effect: { timeCost: 8, focusDelta: -4 },
    },
    right: {
      text: "Ask about solvent",
      nextId: "steel_solvent",
      effect: { timeCost: 8, focusDelta: -4 },
    },
  },

  steel_ledger: {
    id: "steel_ledger",
    text: "You slide a photo of Clara’s scribbled receipt across the desk. Steel doesn’t touch it, just leans in until his jaw tightens. “Everyone in this town thinks my shell companies are some kind of magic trick,” he says. “They’re holding companies. Legal. Boring. If she found irregularities, she should’ve called my lawyers, not your department.” He taps the hawk-stamped folder. “Those bids were greenlit by committee. Councilman Drake signed off, not me. I just build what I’m told, where I’m told. Check who rushed the vote through before you kick my door in.” For a moment, he looks almost hurt. Then the shutters drop, and he’s all polished stone again.",
    image: "📊",
    timeCost: 10,
    focusDelta: -3,
    suspicionDelta: { steel: 1, drake: 2 },
    culpritProfileDelta: { financialMotive: 1, insideJob: 1 },
    left: {
      text: "Head to Drake",
      nextId: "drake_intro",
      effect: { timeCost: 25, focusDelta: -5 },
    },
    right: {
      text: "Step back, rethink",
      nextId: "logic_hub",
      effect: { timeCost: 10, focusDelta: 4 },
    },
  },

  steel_solvent: {
    id: "steel_solvent",
    text: "You drop the lab report on his desk. The brand name of the solvent is circled twice. Steel actually laughs, low and disbelieving. “That’s your big hook? Half the city’s infrastructure contracts run through that supplier. My crews use it, sure. So do Drake’s maintenance cronies, the tunnel rats, the utilities. Anyone trying to erase a few shelves could get it without kissing my ring.” He swivels his monitor so you can see: purchase orders, authorized users, delivery logs that tie his company to a hundred addresses, including the Archives itself. “I sell the torch,” he says. “Doesn’t mean I strike the match.” The records are neat, maybe a little too neat.",
    image: "🧴",
    timeCost: 10,
    focusDelta: -4,
    suspicionDelta: { steel: 1, joe: 1, drake: 1 },
    culpritProfileDelta: { organized: 2, violent: 0 },
    left: {
      text: "Verify logs",
      nextId: "records_lab",
      effect: { timeCost: 20, focusDelta: -3 },
    },
    right: {
      text: "Pull back to case",
      nextId: "logic_hub",
      effect: { timeCost: 10, focusDelta: 3 },
    },
  },

  drake_intro: {
    id: "drake_intro",
    text: "City Hall is mostly dark, the marbled halls echoing with the cleaning crew’s machines. Drake’s office, however, glows like a confession. The councilman is half out of his jacket, tie askew, shredding something with more enthusiasm than accuracy. When you step in, he flinches, then forces a smile that doesn’t reach his damp forehead. “Terrible about Clara,” he says. “We were working so closely on the transparency hearings. I signed whatever she put in front of me.” His eyes flick to the window, where smoke still ghosts above the Archives. On one corner of his desk lies a committee agenda stamped “EMERGENCY SESSION,” scheduled two days before the fire.",
    image: "🏛️",
    timeCost: 18,
    focusDelta: -6,
    suspicionDelta: { drake: 2 },
    culpritProfileDelta: { insideJob: 2, personalMotive: 1 },
    left: {
      text: "Search his bin",
      nextId: "drake_docs",
      effect: { timeCost: 8, focusDelta: -4 },
    },
    right: {
      text: "Lean on fear",
      nextId: "logic_hub",
      effect: { timeCost: 6, focusDelta: -3 },
    },
  },

  drake_docs: {
    id: "drake_docs",
    text: "You ignore Drake’s babble and tilt the shredder, letting a handful of warm confetti spill onto his polished floor. A few strips still cling together: “Reallocation of Archives parcel, contingent on structural loss,” one reads. Another bears Steel’s company name, half eaten. You spot Clara’s signature below a line she clearly tried to cross out before copying. Drake watches you piece it together like a drowning man watching a lifeguard count strokes. “It’s routine contingency planning,” he insists. “Legal boilerplate. If the building failed inspection, the land would go to bid. We can’t store the past forever, right?” His voice cracks on “past,” and he doesn’t blink enough.",
    image: "📃",
    timeCost: 12,
    focusDelta: -4,
    suspicionDelta: { drake: 3, steel: 1 },
    culpritProfileDelta: { financialMotive: 2, insideJob: 2 },
    left: {
      text: "Press him later",
      nextId: "logic_hub",
      effect: { timeCost: 8, focusDelta: 3 },
    },
    right: {
      text: "Loop back to Steel",
      nextId: "steel_intro",
      effect: { timeCost: 20, focusDelta: -3 },
    },
  },

  elena_intro: {
    id: "elena_intro",
    text: "The Rusted Swan leans over the river like it’s thinking of jumping. Inside, the air is jazz, stale beer, and Elena Vostok’s perfume. She lounges in a corner booth, wrist tattoo—a spiderweb—peeking from beneath a cuff. “I heard about the bonfire,” she says before you speak. “Clara was careful. Careful people don’t burn by accident.” She admits to meeting the auditor here, selling her a list of shell corporations and whispered committee deals, some bearing Steel’s hawk, some Drake’s initials. “She said if it went wrong, everyone would know whose fingerprints were on the matchbox,” Elena murmurs. “Then someone decided to clean the slate with lighter fluid.”",
    image: "🕷️",
    timeCost: 22,
    focusDelta: -5,
    suspicionDelta: { elena: 2, steel: 1, drake: 1 },
    culpritProfileDelta: { organized: 2, financialMotive: 1 },
    left: {
      text: "Pay for details",
      nextId: "logic_hub",
      effect: { timeCost: 10, focusDelta: 4 },
    },
    right: {
      text: "Lift her phone",
      nextId: "elena_phone",
      effect: { timeCost: 6, focusDelta: -8 },
    },
  },

  elena_phone: {
    id: "elena_phone",
    text: "While Elena flirts with a bartender she doesn’t care about, your hand slips under her coat on the back of the booth and comes away with her phone. In the alley, its cracked screen blooms with missed calls from blocked numbers and one saved contact labeled simply “Committee.” The last thread of messages is with an unsaved number, but the pattern is clear: Clara asking for confirmation on leaked bids, Elena warning that “one of them wants the files gone, not the truth out.” Attached is a grainy photo from earlier tonight—Clara at the Archives entrance, talking to a man in a reflective vest whose face is cropped just above the mouth.",
    image: "📱",
    timeCost: 10,
    focusDelta: -6,
    suspicionDelta: { elena: 1, drake: 2, steel: 1 },
    culpritProfileDelta: { personalMotive: 1, insideJob: 1 },
    left: {
      text: "Return to case board",
      nextId: "logic_hub",
      effect: { timeCost: 10, focusDelta: 3 },
    },
    right: {
      text: "Double back to Drake",
      nextId: "drake_intro",
      effect: { timeCost: 25, focusDelta: -3 },
    },
  },

  logic_hub: {
    id: "logic_hub",
    text: "You end up on a bench across from the smoldering Archives, coffee cooling untouched in your hand. The city hums, oblivious. Clara chased money through shell companies and committee votes. Steel profits when old bricks fall. Drake signs what keeps him elected. Elena sells whatever secrets keep her afloat. Joe sees the shadows the city pretends it doesn’t cast. The fire was precise, the access privileged, the timing surgical. Someone wanted the records gone, the auditor silenced, and the story neat enough to fold into tomorrow’s news cycle. You can keep circling the same names, or you can draw a line, pick a suspect, and live with the version of the truth that choice creates.",
    image: "🌧️",
    timeCost: 6,
    focusDelta: 8,
    left: {
      text: "Revisit the scene",
      nextId: "start",
      effect: { timeCost: 15, focusDelta: -4 },
    },
    right: {
      text: "Confront a suspect",
      nextId: "steel_intro",
      effect: { timeCost: 20, focusDelta: -5 },
    },
  },
};
