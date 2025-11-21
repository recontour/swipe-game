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
    text: "The abandoned station at 4th & King smells of ozone, wet concrete, and old blood. Senator O'Malley is sprawled across the tracks, his expensive suit ruined by the grime. The rats are gathering in the shadows. You check your watch. The morning trains start in a few hours, which means this scene—and your evidence—will be gone. Where do you start, Detective?",
    image: "💀",
    timeCost: 0, // Initial setup
    focusDelta: 0,
    left: {
      text: "Examine Body",
      nextId: "body_search",
      effect: { timeCost: 10, focusDelta: -5 },
    },
    right: {
      text: "Scan Platform",
      nextId: "platform_search",
      effect: { timeCost: 15, focusDelta: -5 },
    },
  },

  body_search: {
    id: "body_search",
    text: "You hop onto the tracks. O'Malley's face is frozen in a rictus of terror. There's no blood on his shirt, but rolling him over reveals a single, surgical puncture wound at the base of the skull. A professional hit disguised as a mugging. Near his hand, you find a diamond-encrusted tie clip shaped like a Hawk—the logo of Steel Construction.",
    image: "👔",
    timeCost: 5,
    focusDelta: -5,
    // Surgical wound suggests organization; Hawk clip points to Steel
    culpritProfileDelta: { organized: 2, violent: 0, personalMotive: 0 },
    suspicionDelta: { steel: 3 },
    left: {
      text: "Visit Steel HQ",
      nextId: "steel_intro",
      effect: { timeCost: 30, focusDelta: -5 },
    },
    right: {
      text: "Check Pockets",
      nextId: "pocket_clue",
      effect: { timeCost: 5, focusDelta: -2 },
    },
  },

  platform_search: {
    id: "platform_search",
    text: "You scan the graffitied walls. Among the spray paint, you notice a fresh smudge of red lipstick on a discarded cigarette butt near a structural pillar. It's 'Velvet Crimson'—imported, expensive, and rare. The only person in the underworld vain enough to wear that in a sewer is Elena 'The Spider' Vostok. She was here, watching.",
    image: "💄",
    timeCost: 10,
    focusDelta: -5,
    // Presence of a broker suggests information trade
    culpritProfileDelta: { organized: 1, financialMotive: 1 },
    suspicionDelta: { elena: 2 },
    left: {
      text: "Find Elena",
      nextId: "elena_intro",
      effect: { timeCost: 45, focusDelta: -10 },
    },
    right: {
      text: "Find Witnesses",
      nextId: "joe_intro",
      effect: { timeCost: 20, focusDelta: -5 },
    },
  },

  pocket_clue: {
    id: "pocket_clue",
    text: "The Senator's wallet is missing—likely taken to stage a robbery—but inside his jacket lining, you find a crumpled dinner receipt from 'The Gilded Cage' dated two hours ago. On the back, scribbled in shaky handwriting: 'Drake knows. He's going to leak the transit files.' It seems Councilman Drake was blackmailing the victim just hours before the murder.",
    image: "📄",
    timeCost: 5,
    focusDelta: -2,
    // Blackmail implies inside knowledge and personal stakes
    culpritProfileDelta: { insideJob: 2, personalMotive: 2 },
    suspicionDelta: { drake: 3 },
    left: {
      text: "Grill Drake",
      nextId: "drake_intro",
      effect: { timeCost: 40, focusDelta: -10 },
    },
    right: {
      text: "Go to Steel",
      nextId: "steel_intro",
      effect: { timeCost: 30, focusDelta: -5 },
    },
  },

  steel_intro: {
    id: "steel_intro",
    text: "Marcus Steel's office is a glass fortress overlooking the city he wants to own. He pours two scotches, unbothered. 'O'Malley was a roadblock to progress,' Steel says smoothly, gesturing to blueprints. 'But I don't kill roadblocks, Detective. I buy them. Why use a needle when I have a checkbook?' He seems too calm for an innocent man.",
    image: "🏙️",
    timeCost: 10,
    focusDelta: -5,
    culpritProfileDelta: { financialMotive: 2, organized: 1 },
    left: {
      text: "Show Tie Clip",
      nextId: "steel_reaction",
      effect: { timeCost: 10, focusDelta: -5 },
    },
    right: {
      text: "Ask for Info",
      nextId: "steel_bribe",
      // Taking info/bribe helps focus but increases corruption/financial profile
      effect: {
        timeCost: 5,
        focusDelta: 10,
        culpritProfileDelta: { financialMotive: 1 },
      },
    },
  },

  steel_reaction: {
    id: "steel_reaction",
    text: "Steel's eyes narrow when he sees the hawk clip. The mask slips. 'I haven't worn that in months,' he hisses. 'I gave it to Elena as payment for dirt on the Senator. That witch framed me. She wanted O'Malley dead because he threatened to expose her smuggling ring.' He smashes his glass. 'She has the motive, not me.'",
    image: "😡",
    timeCost: 5,
    focusDelta: -10, // Conflict is draining
    culpritProfileDelta: { personalMotive: 1 },
    suspicionDelta: { elena: 2, steel: -1 },
    left: {
      text: "Find Elena",
      nextId: "elena_intro",
      effect: { timeCost: 30, focusDelta: -5 },
    },
    right: {
      text: "Press Harder",
      nextId: "steel_fight",
      effect: { timeCost: 15, focusDelta: -15 },
    },
  },

  steel_bribe: {
    id: "steel_bribe",
    text: "Steel chuckles and slides a heavy envelope across the mahogany desk. 'You're a smart man. Go ask the homeless guy, Joe, what he saw. I pay him to keep the tunnels clear of... debris.' Steel winks. You take the lead, but the transaction leaves a bitter taste in your mouth.",
    image: "💵",
    timeCost: 5,
    focusDelta: 5, // Money/Lead relieves stress
    suspicionDelta: { steel: 1, joe: 1 }, // Steel looks guilty for bribing; Joe is involved
    left: {
      text: "Find Joe",
      nextId: "joe_intro",
      effect: { timeCost: 20, focusDelta: -5 },
    },
    right: {
      text: "Go to Drake",
      nextId: "drake_intro",
      effect: { timeCost: 30, focusDelta: -10 },
    },
  },

  steel_fight: {
    id: "steel_fight",
    text: "You get in Steel's face, but his security guards intervene. Before you're thrown out, you spot a file on his desk: 'Demolition Order - Sector 7 - Approved by O'Malley.' If O'Malley approved the demo, Steel had no reason to kill him. Steel was lying about the Senator being a roadblock. Why lie if the truth clears you?",
    image: "👊",
    timeCost: 20, // Getting thrown out takes time
    focusDelta: -20, // Getting beat up hurts focus
    culpritProfileDelta: { insideJob: 1, organized: -1 }, // Inconsistency found
    left: {
      text: "Rethink Case",
      nextId: "logic_hub",
      effect: { timeCost: 10, focusDelta: 5 },
    },
    right: {
      text: "Review Files",
      nextId: "logic_hub",
      effect: { timeCost: 10, focusDelta: 5 },
    },
  },

  elena_intro: {
    id: "elena_intro",
    text: "Elena is waiting in a smoky jazz club, wearing the Velvet Crimson lipstick. 'I was there,' she admits, blowing smoke. 'I saw Steel arguing with O'Malley. But I didn't kill him. I left when Steel pulled out a strange, thin case. It looked like a medical kit.' She smiles. 'I sell secrets, Detective. Corpses are bad for business.'",
    image: "💃",
    timeCost: 15,
    focusDelta: -5,
    suspicionDelta: { steel: 2 },
    culpritProfileDelta: { organized: 1, violent: 0 },
    left: {
      text: "Trust Her",
      nextId: "logic_hub",
      effect: { timeCost: 10, focusDelta: 5 },
    },
    right: {
      text: "Check Her Bag",
      nextId: "elena_bag",
      effect: { timeCost: 5, focusDelta: -10 },
    },
  },

  elena_bag: {
    id: "elena_bag",
    text: "You snatch her purse. No poison, but you find a wire transfer confirmation. Councilman Drake paid her $50,000 yesterday. 'Fine!' she screams. 'Drake hired me to steal the blackmail photos O'Malley had on him! I was just the thief! I saw Drake running from the tunnel entrance as I went in!'",
    image: "👜",
    timeCost: 5,
    focusDelta: -5,
    culpritProfileDelta: { financialMotive: 1, insideJob: 1 },
    suspicionDelta: { drake: 3, elena: -1 },
    left: {
      text: "Find Drake",
      nextId: "drake_intro",
      effect: { timeCost: 30, focusDelta: -10 },
    },
    right: {
      text: "Back to Steel",
      nextId: "steel_intro",
      effect: { timeCost: 30, focusDelta: -5 },
    },
  },

  joe_intro: {
    id: "joe_intro",
    text: "Homeless Joe is shivering near a burning trash can. He's terrified. 'I saw the shadow!' he babbles. 'The man in the fancy suit! He stuck the Senator in the neck! Then he wiped the needle and put it in his pocket. He was wearing a hawk on his tie! A hawk!' Joe starts coughing violently.",
    image: "🗑️",
    timeCost: 10,
    focusDelta: -5,
    // Witness testimony reinforces Steel (Hawk) and Method (Needle)
    suspicionDelta: { steel: 2 },
    culpritProfileDelta: { violent: 1, organized: 1 },
    left: {
      text: "Offer Food",
      nextId: "joe_secret",
      effect: { timeCost: 15, focusDelta: 5 },
    },
    right: {
      text: "Shake Down",
      nextId: "joe_scared",
      effect: {
        timeCost: 5,
        focusDelta: -10,
        culpritProfileDelta: { violent: 1 },
      },
    },
  },

  joe_secret: {
    id: "joe_secret",
    text: "Joe eats gratefully. 'Wait... the man made a call. He said, 'It's done, Councilman. The deal is yours.' He was talking to Drake!' This changes things. Steel might have been the executioner, but was he working for Drake? Or is Joe confused about who was on the phone?",
    image: "🤫",
    timeCost: 10,
    focusDelta: 5,
    suspicionDelta: { drake: 2, steel: 1 },
    culpritProfileDelta: { insideJob: 1, financialMotive: 1 },
    left: {
      text: "Confront Drake",
      nextId: "drake_intro",
      effect: { timeCost: 20, focusDelta: -5 },
    },
    right: {
      text: "Review Data",
      nextId: "logic_hub",
      effect: { timeCost: 5, focusDelta: 5 },
    },
  },

  joe_scared: {
    id: "joe_scared",
    text: "Joe recoils, eyes wide. 'No! Don't hurt me! I didn't see nothing! Just the hawk! Leave me alone!' He scrambles into a storm drain. You lost your best witness by pushing too hard.",
    image: "🏃",
    timeCost: 10,
    focusDelta: -15, // Guilt/Frustration
    suspicionDelta: { steel: 1 }, // Only kept the hawk clue
    left: {
      text: "Find Drake",
      nextId: "drake_intro",
      effect: { timeCost: 30, focusDelta: -5 },
    },
    right: {
      text: "Back to HQ",
      nextId: "steel_intro",
      effect: { timeCost: 30, focusDelta: -5 },
    },
  },

  drake_intro: {
    id: "drake_intro",
    text: "Councilman Drake is sweating profusely in his office. He's shredding documents. 'I had nothing to do with it!' he yells before you even ask. 'Steel is a maniac! He offered to remove O'Malley so I could approve the zoning permits. I told him no, but he did it anyway! I'm just a pawn!'",
    image: "😰",
    timeCost: 15,
    focusDelta: -5,
    culpritProfileDelta: { insideJob: 2, organized: -1 }, // Panic suggests lack of organization
    suspicionDelta: { drake: 1, steel: 1 },
    left: {
      text: "Check Shredder",
      nextId: "drake_shreds",
      effect: { timeCost: 10, focusDelta: -5 },
    },
    right: {
      text: "Press Him",
      nextId: "logic_hub",
      effect: { timeCost: 5, focusDelta: -5 },
    },
  },

  drake_shreds: {
    id: "drake_shreds",
    text: "You piece together the shreds. It's an email from Steel to Drake: 'If O'Malley doesn't sign by Friday, I will handle it personally. Keep your mouth shut and enjoy your new district.' It looks like the smoking gun. Steel premeditated the murder to force the construction deal through.",
    image: "🧩",
    timeCost: 15,
    focusDelta: 5, // Clarity found
    culpritProfileDelta: { organized: 2, financialMotive: 2 },
    suspicionDelta: { steel: 3 },
    left: {
      text: "Review Case",
      nextId: "logic_hub",
      effect: { timeCost: 5, focusDelta: 0 },
    },
    right: {
      text: "Review Case",
      nextId: "logic_hub",
      effect: { timeCost: 5, focusDelta: 0 },
    },
  },

  logic_hub: {
    id: "logic_hub",
    text: "You step out into the rain to clear your head. The pieces are all here. Steel's tie clip. Elena's lipstick. Drake's blackmail. Joe's testimony. The killer had a plan, a motive, and the nerve to execute it. You can chase more leads, or open your case file and make an arrest right now.",
    image: "🌧️",
    timeCost: 5,
    focusDelta: 10, // Regaining composure
    left: {
      text: "Check Body",
      nextId: "start",
      effect: { timeCost: 10, focusDelta: -5 },
    },
    right: {
      text: "Visit Steel",
      nextId: "steel_intro",
      effect: { timeCost: 20, focusDelta: -5 },
    },
  },
};
