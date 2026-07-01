export type RaceOption = {
    value: string;
    label: string;
};

export type AbilityScores = {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
};

export type CharacterSummary = {
    id: number;
    name: string;
    /** Display-ready lineage label, e.g. "Half-Orc". */
    race: string;
    /** Display-ready class label, e.g. "Fighter". */
    class: string;
    stats: AbilityScores;
    is_agent: boolean;
    backstory: string | null;
};

export type CampaignSummary = {
    id: number;
    name: string;
    world_description: string | null;
};
