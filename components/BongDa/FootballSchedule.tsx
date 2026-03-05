
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface SimpleMatch {
    id: string;
    date: string;
    time: string;
    opponent: string;
    competition: string;
    isHome: boolean;
    crest?: string;
}

interface ScheduleCache {
    timestamp: number;
    matches: SimpleMatch[];
    sources: Array<{ uri: string, title: string }>;
}

const CACHE_KEY = 'huyvu_football_schedule_v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Pre-defined logos for major teams to ensure reliability and speed
const PREDEFINED_LOGOS: { [key: string]: string } = {
    // --- MANCHESTER CITY ---
    "Man City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    "Manchester City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",

    // --- PREMIER LEAGUE (Big 6 & Rivals) ---
    "Liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    "Arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    "Chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    "Manchester United": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    "Man United": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    "Man Utd": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    "Tottenham": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
    "Tottenham Hotspur": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
    "Spurs": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
    "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg",
    "Newcastle": "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
    "Newcastle United": "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",

    // --- PREMIER LEAGUE (Rest of the league) ---
    "West Ham": "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
    "West Ham United": "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
    "Brighton": "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg",
    "Wolverhampton": "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg",
    "Wolves": "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg",
    "Fulham": "https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg",
    "Bournemouth": "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg",
    "Crystal Palace": "https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg",
    "Brentford": "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    "Everton": "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
    "Nottingham Forest": "https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg",
    "Nottm Forest": "https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg",
    "Leicester": "https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg",
    "Leicester City": "https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg",
    "Ipswich": "https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg",
    "Ipswich Town": "https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg",
    "Southampton": "https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg",

    // --- CHAMPIONS LEAGUE / EUROPE (Spain) ---
    "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    "Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    "Atletico Madrid": "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
    "Girona": "https://upload.wikimedia.org/wikipedia/en/9/90/For_Girona_FC.svg",
    "Sevilla": "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",

    // --- CHAMPIONS LEAGUE / EUROPE (Germany) ---
    "Bayern Munich": "https://upload.wikimedia.org/wikipedia/en/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    "Bayern": "https://upload.wikimedia.org/wikipedia/en/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    "Dortmund": "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
    "Borussia Dortmund": "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
    "Leverkusen": "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
    "Bayer Leverkusen": "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
    "Leipzig": "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg",
    "RB Leipzig": "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg",
    "Stuttgart": "https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg",

    // --- CHAMPIONS LEAGUE / EUROPE (France) ---
    "PSG": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    "Paris Saint-Germain": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    "Monaco": "https://upload.wikimedia.org/wikipedia/en/fd/AS_Monaco_FC_logo.svg",
    "Lille": "https://upload.wikimedia.org/wikipedia/en/6/6f/LOSC_Lille_Logo.svg",
    "Brest": "https://upload.wikimedia.org/wikipedia/en/0/05/Stade_Brestois_29_logo.svg",

    // --- CHAMPIONS LEAGUE / EUROPE (Italy) ---
    "Inter Milan": "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
    "Inter": "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
    "AC Milan": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
    "Juventus": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg",
    "Atalanta": "https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg",
    "Bologna": "https://upload.wikimedia.org/wikipedia/en/5/5b/Bologna_F.C._1909_logo.svg",

    // --- CHAMPIONS LEAGUE / EUROPE (Others) ---
    "Benfica": "https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",
    "Sporting CP": "https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg",
    "Sporting Lisbon": "https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg",
    "Porto": "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg",
    "Feyenoord": "https://upload.wikimedia.org/wikipedia/en/e/e3/Feyenoord_logo.svg",
    "PSV": "https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg",
    "Celtic": "https://upload.wikimedia.org/wikipedia/en/1/11/Celtic_FC.svg",
    "Rangers": "https://upload.wikimedia.org/wikipedia/en/4/43/Rangers_FC.svg",
    "Salzburg": "https://upload.wikimedia.org/wikipedia/en/8/8f/FC_Red_Bull_Salzburg_logo.svg",
    "Club Brugge": "https://upload.wikimedia.org/wikipedia/en/d/d0/Club_Brugge_KV_logo.svg",
    "Shakhtar": "https://upload.wikimedia.org/wikipedia/en/a/a1/FC_Shakhtar_Donetsk.svg",
    "Young Boys": "https://upload.wikimedia.org/wikipedia/en/6/6b/BSC_Young_Boys_logo.svg",
    "Sparta Prague": "https://upload.wikimedia.org/wikipedia/en/3/39/AC_Sparta_Praha_logo.svg",
    "Slovan Bratislava": "https://upload.wikimedia.org/wikipedia/en/9/90/Slovan_Bratislava_logo.svg",
    "Red Star Belgrade": "https://upload.wikimedia.org/wikipedia/commons/f/f0/FK_Crvena_Zvezda.svg",
    "Dinamo Zagreb": "https://upload.wikimedia.org/wikipedia/en/f/f4/NK_Dinamo_Zagreb.svg",

    // --- OTHER (Club World Cup / USA / Friendlies) ---
    "Inter Miami": "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg",
    "Seattle Sounders": "https://upload.wikimedia.org/wikipedia/en/a/a4/Seattle_Sounders_FC_logo.svg",
    "Al Ahly": "https://upload.wikimedia.org/wikipedia/en/a/a8/Al_Ahly_SC_logo.svg",

    // --- FA CUP / CARABAO / CHAMPIONSHIP ---
    "Sunderland": "https://upload.wikimedia.org/wikipedia/en/7/77/Sunderland_AFC_logo.svg",
    "Sunderland AFC": "https://upload.wikimedia.org/wikipedia/en/7/77/Sunderland_AFC_logo.svg",
    "Leeds": "https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg",
    "Leeds United": "https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg",
    "Watford": "https://upload.wikimedia.org/wikipedia/en/e/e2/Watford.svg",
    "Burnley": "https://upload.wikimedia.org/wikipedia/en/6/62/Burnley_F.C._Logo.svg",
    "Sheffield United": "https://upload.wikimedia.org/wikipedia/en/9/9c/Sheffield_United_FC_logo.svg",
    "Luton": "https://upload.wikimedia.org/wikipedia/en/9/9d/Luton_Town_logo.svg",
    "Middlesbrough": "https://upload.wikimedia.org/wikipedia/en/2/2c/Middlesbrough_FC_crest.svg",
    "Norwich": "https://upload.wikimedia.org/wikipedia/en/8/8c/Norwich_City.svg",
    "Blackburn": "https://upload.wikimedia.org/wikipedia/en/0/0f/Blackburn_Rovers.svg",
    "Coventry": "https://upload.wikimedia.org/wikipedia/en/0/0b/Coventry_City_F.C._logo.svg",
    "Stoke": "https://upload.wikimedia.org/wikipedia/en/2/29/Stoke_City_FC.svg",
    "Stoke City": "https://upload.wikimedia.org/wikipedia/en/2/29/Stoke_City_FC.svg"
};

const MatchItem: React.FC<{ match: SimpleMatch }> = ({ match }) => {
    const mcCrest = PREDEFINED_LOGOS["Man City"];

    const getOpponentCrest = () => {
        // 1. Direct match
        if (PREDEFINED_LOGOS[match.opponent]) {
            return PREDEFINED_LOGOS[match.opponent];
        }

        // 2. Fuzzy match (Case insensitive & Partial)
        const lowerOpp = match.opponent.toLowerCase();
        for (const [teamName, url] of Object.entries(PREDEFINED_LOGOS)) {
            const lowerKey = teamName.toLowerCase();
            if (lowerOpp.includes(lowerKey) || lowerKey.includes(lowerOpp)) {
                return url;
            }
        }

        // 3. Fallback to API provided link if valid
        if (match.crest && match.crest !== 'N/A' && match.crest.startsWith('http')) {
            return match.crest;
        }

        // 4. Last resort: UI Avatars
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(match.opponent)}&background=f3f4f6&color=6b7280&size=64&font-size=0.33&length=2`;
    };

    const oppCrest = getOpponentCrest();
    const homeCrest = match.isHome ? mcCrest : oppCrest;
    const awayCrest = match.isHome ? oppCrest : mcCrest;
    const homeName = match.isHome ? "Man City" : match.opponent;
    const awayName = match.isHome ? match.opponent : "Man City";

    return (
        <li className="flex flex-col p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 overflow-hidden w-[40%]">
                    <img src={homeCrest} alt={homeName} className="w-8 h-8 object-contain flex-shrink-0 bg-white rounded-full p-0.5 shadow-sm" />
                    <span className={`font-semibold truncate text-xs sm:text-sm ${match.isHome ? 'text-indigo-700' : 'text-gray-800'}`}>{homeName}</span>
                </div>
                <span className="font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] sm:text-xs whitespace-nowrap">{match.time}</span>
                <div className="flex items-center gap-3 overflow-hidden justify-end w-[40%]">
                    <span className={`font-semibold truncate text-right text-xs sm:text-sm ${!match.isHome ? 'text-indigo-700' : 'text-gray-800'}`}>{awayName}</span>
                    <img src={awayCrest} alt={awayName} className="w-8 h-8 object-contain flex-shrink-0 bg-white rounded-full p-0.5 shadow-sm" />
                </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 gap-2">
                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium truncate max-w-[150px]">{match.competition}</span>
                <span className="whitespace-nowrap font-medium">{match.date}</span>
            </div>
        </li>
    );
};

const FootballSchedule: React.FC = () => {
    const [matches, setMatches] = useState<SimpleMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sources, setSources] = useState<Array<{ uri: string, title: string }>>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    // Mock Data Generator for Offline/Fallback
    const generateMockSchedule = (): SimpleMatch[] => {
        const today = new Date();
        const nextMatchDate = new Date(today);
        nextMatchDate.setDate(today.getDate() + (3 + Math.floor(Math.random() * 3))); // Next match in 3-5 days

        const mocks: SimpleMatch[] = [
            {
                id: 'mock-1',
                date: `${nextMatchDate.getDate()}/${nextMatchDate.getMonth() + 1}`,
                time: '22:00',
                opponent: 'Liverpool',
                competition: 'Premier League',
                isHome: true,
                crest: PREDEFINED_LOGOS['Liverpool']
            },
            {
                id: 'mock-2',
                date: `${nextMatchDate.getDate() + 7}/${nextMatchDate.getMonth() + 1}`,
                time: '03:00',
                opponent: 'Real Madrid',
                competition: 'Champions League',
                isHome: false,
                crest: PREDEFINED_LOGOS['Real Madrid']
            },
            {
                id: 'mock-3',
                date: `${nextMatchDate.getDate() + 14}/${nextMatchDate.getMonth() + 1}`,
                time: '23:30',
                opponent: 'Arsenal',
                competition: 'Premier League',
                isHome: false,
                crest: PREDEFINED_LOGOS['Arsenal']
            }
        ];
        return mocks;
    };

    const loadFromCache = () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const data: ScheduleCache = JSON.parse(cached);
                const age = Date.now() - data.timestamp;
                if (age < CACHE_DURATION && data.matches.length > 0) {
                    setMatches(data.matches);
                    setSources(data.sources || []);
                    setLastUpdated(data.timestamp);
                    setLoading(false);
                    return true;
                }
            }
        } catch (e) {
            console.error("Cache load failed", e);
        }
        return false;
    };

    const fetchSchedule = async (force = false) => {
        if (!force && loadFromCache()) return;

        setLoading(true);
        setError(null);
        try {
            // Robust API Key Strategy (Exact same as AICodeDoctor)
            let apiKey = '';
            try {
                // @ts-ignore
                if (typeof process !== 'undefined' && process.env) {
                    apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || process.env.REACT_APP_API_KEY || '';
                }
                // @ts-ignore
                if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
                    // @ts-ignore
                    apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY || '';
                }
            } catch (e) { console.warn("Env check failed", e); }

            // Note: If no API key is found, feature will be disabled
            // You need to create a .env file with VITE_GOOGLE_AI_API_KEY to enable this feature


            if (!apiKey) {
                // Trigger fallback immediately if no key
                throw new Error("API Key missing");
            }

            const ai = new GoogleGenAI({ apiKey });

            // IMPORTANT: Prompt specifically asks for strict format to avoid parsing errors
            const prompt = `List the next 5 confirmed official matches for Manchester City Men's Team (Timezone: GMT+7/Vietnam Time).
            Rules:
            1. STRICT Format per line: Date(dd/mm)|Time(HH:mm)|Opponent Name|Competition|Home or Away
            2. Example: 26/11|03:00|Feyenoord|UCL|Home
            3. Do not include logos or markdown images in the response text, I have them pre-defined.
            4. If exact time is TBD, estimate or put 00:00.
            5. Return ONLY the list. No intro text.`;

            let response;
            let usedSearch = false;

            try {
                // Attempt 1: With Search
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        tools: [{ googleSearch: {} }],
                        temperature: 0.1
                    }
                });
                usedSearch = true;
            } catch (searchError) {
                console.warn("Search failed, falling back to basic generation", searchError);
                // Attempt 2: Without Search
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        temperature: 0.1
                    }
                });
            }

            // Safe extraction of sources
            // @ts-ignore
            const chunks = usedSearch ? (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) : [];
            const extractedSources = chunks
                // @ts-ignore
                .map(c => c.web ? { uri: c.web.uri, title: c.web.title } : null)
                .filter(Boolean) as Array<{ uri: string, title: string }>;

            const uniqueSources = extractedSources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i).slice(0, 3);

            const text = response.text || '';
            const lines = text.split('\n').filter(l => l.includes('|'));

            const parsedMatches: SimpleMatch[] = lines.map((line, index) => {
                const parts = line.split('|').map(s => s.trim());
                if (parts.length >= 5) {
                    return {
                        id: `match-${Date.now()}-${index}`,
                        date: parts[0],
                        time: parts[1],
                        opponent: parts[2],
                        competition: parts[3],
                        isHome: parts[4].toLowerCase().includes('home'),
                        crest: 'N/A' // Handled by component via PREDEFINED_LOGOS
                    };
                }
                return null;
            }).filter(Boolean) as SimpleMatch[];

            if (parsedMatches.length > 0) {
                setMatches(parsedMatches);
                setSources(uniqueSources);

                const cacheData: ScheduleCache = {
                    timestamp: Date.now(),
                    matches: parsedMatches,
                    sources: uniqueSources
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                setLastUpdated(Date.now());
            } else {
                throw new Error("Không lấy được dữ liệu chuẩn.");
            }

        } catch (err: any) {
            console.error("Error fetching schedule, using fallback:", err);
            // FALLBACK TO MOCK DATA if API fails completely
            const mocks = generateMockSchedule();
            setMatches(mocks);
            setSources([]);
            // Don't save mock data to cache to retry API next time
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule(false);
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const formatLastUpdated = () => {
        if (!lastUpdated) return 'Tự động';
        const date = new Date(lastUpdated);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getDate()}/${date.getMonth() + 1}`;
    };

    const displayCount = 3;

    return (
        <div className="flex flex-col relative group">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-700 flex flex-col">
                    Lịch thi đấu Man City
                    <span className="text-[10px] text-gray-400 font-normal">
                        Cập nhật: {formatLastUpdated()}
                    </span>
                </h3>
                <button
                    onClick={() => fetchSchedule(true)}
                    disabled={loading}
                    className={`p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all ${loading ? 'animate-spin' : ''}`}
                    title="Cập nhật lịch mới"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
            </div>

            <div className="flex-grow overflow-hidden min-h-[100px]">
                {loading && matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-gray-500 animate-pulse">Đang tải...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-sm">Chưa có lịch thi đấu.</div>
                ) : (
                    <>
                        <ul className="space-y-2">
                            {matches.slice(0, displayCount).map(match => (
                                <MatchItem key={match.id} match={match} />
                            ))}
                        </ul>
                        {matches.length > displayCount && (
                            <button
                                onClick={handleOpenModal}
                                className="w-full mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100"
                            >
                                Xem thêm ({matches.length - displayCount})
                            </button>
                        )}
                    </>
                )}
            </div>

            {!loading && sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {sources.map((src, idx) => (
                            <a
                                key={idx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-gray-300 hover:text-indigo-500 truncate max-w-[80px]"
                                title={src.title}
                            >
                                {new URL(src.uri).hostname.replace('www.', '')}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b">
                            <h4 className="font-bold text-lg text-gray-800">Lịch thi đấu ({matches.length})</h4>
                            <button onClick={handleCloseModal} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </header>
                        <div className="p-4 overflow-y-auto">
                            <ul className="space-y-3">
                                {matches.map(match => (
                                    <MatchItem key={match.id} match={match} />
                                ))}
                            </ul>
                            <div className="mt-4 text-center">
                                <button onClick={() => { handleCloseModal(); fetchSchedule(true); }} className="text-xs text-indigo-600 font-bold hover:underline">
                                    Cập nhật dữ liệu mới nhất
                                </button>
                            </div>
                        </div>
                    </div>
                    <style>{`
                      @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; }}
                      @keyframes scale-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); }}
                      .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                      .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default FootballSchedule;
