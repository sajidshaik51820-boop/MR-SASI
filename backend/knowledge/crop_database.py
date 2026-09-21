"""
Agronomic Crop Knowledge, Growth Frameworks, and Sustainable Care Database
Contains verified static agronomic information for multi-crop management.
"""

from typing import Dict, List, Any, Optional

CROPS_DATABASE: Dict[str, Dict[str, Any]] = {
    "Tomato": {
        "name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "family": "Solanaceae",
        "description": "One of the world's most widely grown warm-season horticultural crops, sensitive to frost, excessive humidity, and soil-borne fungal/bacterial pathogens.",
        "growth_cycle_days": "70 - 100 days from transplanting",
        "optimal_climate": {
            "temperature": "18°C - 28°C (64°F - 82°F)",
            "soil_ph": "6.0 - 6.8 (well-drained loam)",
            "sunlight": "Full sun, 6-8 hours direct light daily",
            "water_needs": "1.0 - 1.5 inches per week; uniform drip irrigation preferred"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "Seed Germination & Emergence",
                "duration_days": "6 - 12 days",
                "description": "Seeds absorb moisture, the radicle emerges, and cotyledon leaves unfurl above soil surface.",
                "what_is_happening": "Cell division and root system initialization. Seedling utilizes stored endosperm reserves.",
                "farmer_monitoring": "Check soil temperature (21-26°C optimal), monitor damping-off fungi (Pythium/Rhizoctonia), avoid waterlogging.",
                "care_considerations": "Maintain moist but well-drained media, provide gentle bottom heat and immediate light exposure.",
                "next_stage": "Seedling & Early Vegetative"
            },
            {
                "stage_number": 2,
                "name": "Seedling & Early Vegetative",
                "duration_days": "20 - 30 days",
                "description": "True compound leaves form, root architecture expands, and stems thicken.",
                "what_is_happening": "Rapid vegetative accumulation, lateral root branching, photosynthetic leaf area expansion.",
                "farmer_monitoring": "Scout for aphids, thrips, flea beetles, and early signs of damping off or leaf spots.",
                "care_considerations": "Harden off before transplanting, space 45-60 cm apart, avoid excessive high-nitrogen fertilizer.",
                "next_stage": "Rapid Vegetative & Branching"
            },
            {
                "stage_number": 3,
                "name": "Rapid Vegetative & Branching",
                "duration_days": "20 - 25 days",
                "description": "Intense stem lengthening, main axis branching, and robust canopy leaf development.",
                "what_is_happening": "Biomass doubles, root zone penetrates deeper into subsoil strata.",
                "farmer_monitoring": "Check lower leaves for Early Blight or Septoria spots, check staking/trellising integrity.",
                "care_considerations": "Prune lower suckers if determinate/indeterminate management requires, apply mulch to block soil splash.",
                "next_stage": "Flowering & Anthesis"
            },
            {
                "stage_number": 4,
                "name": "Flowering & Anthesis",
                "duration_days": "15 - 20 days",
                "description": "Bright yellow flower clusters open, pollen shed occurs via buzz pollination.",
                "what_is_happening": "Floral induction, pollination and fertilization of ovary tissues.",
                "farmer_monitoring": "Monitor blossom drop caused by temperatures >32°C or <13°C; check for thrips and spider mites.",
                "care_considerations": "Avoid overhead watering to protect pollen viability; supply adequate calcium and potassium.",
                "next_stage": "Fruit Set & Green Fruit Development"
            },
            {
                "stage_number": 5,
                "name": "Fruit Set & Green Fruit Development",
                "duration_days": "25 - 35 days",
                "description": "Ovaries swell into green fruit; rapid cellular enlargement and starch accumulation.",
                "what_is_happening": "Fruit acts as the primary metabolic sink; calcium translocated via transpiration stream.",
                "farmer_monitoring": "Scout for Blossom End Rot (calcium/water stress), Tomato Hornworms, and Fruit Borer punctures.",
                "care_considerations": "Ensure steady, consistent watering to prevent fruit cracking and blossom end rot.",
                "next_stage": "Color Break & Ripening"
            },
            {
                "stage_number": 6,
                "name": "Color Break & Ripening",
                "duration_days": "10 - 15 days",
                "description": "Chlorophyll breaks down, lycopene and carotenoids synthesize, fruit turns pink to deep red.",
                "what_is_happening": "Enzymatic softening of cell walls, conversion of starches to sugars and aromatic esters.",
                "farmer_monitoring": "Monitor fruit rot (Anthracnose), sunscald from defoliation, and bird/rodent feeding.",
                "care_considerations": "Moderate irrigation slightly to enhance sugar concentration and flavor.",
                "next_stage": "Harvest & Post-Harvest"
            },
            {
                "stage_number": 7,
                "name": "Harvest & Post-Harvest",
                "duration_days": "15 - 30 days (successive)",
                "description": "Mature firm red fruits harvested by hand with calyx intact for market.",
                "what_is_happening": "Post-harvest respiration; physiological vine senescence begins.",
                "farmer_monitoring": "Sort bruised or blemished fruit immediately to prevent mold dissemination in storage.",
                "care_considerations": "Store fruit between 12°C - 15°C (never refrigerate green/breaking tomatoes). Clean crop residues promptly.",
                "next_stage": "Field Sanitation & Rotation"
            }
        ],
        "common_diseases": [
            {
                "name": "Early Blight",
                "pathogen": "Alternaria solani (Fungus)",
                "symptoms": "Dark brown to black spots with characteristic concentric rings ('target board') on older foliage, surrounded by yellow halos.",
                "causes": "High humidity, prolonged leaf wetness (dew or overhead irrigation), temperature 24-29°C.",
                "affected_parts": "Lower leaves, stems, occasional fruit rot",
                "risk": "High if left unmanaged; causes extensive defoliation and sunscald."
            },
            {
                "name": "Late Blight",
                "pathogen": "Phytophthora infestans (Oomycete)",
                "symptoms": "Rapidly expanding water-soaked greasy gray-green lesions with white fungal/oomycete down on leaf undersides during moist weather.",
                "causes": "Cool (15-22°C), persistently wet conditions, fog, rain, poor air drainage.",
                "affected_parts": "Leaves, petioles, stems, whole green/ripe fruits",
                "risk": "Critical; can destroy entire fields within 7 to 10 days."
            },
            {
                "name": "Bacterial Spot",
                "pathogen": "Xanthomonas perforans / euvesicatoria",
                "symptoms": "Small, dark, water-soaked spots on foliage that become angular, necrotic, and turn leaves yellow.",
                "causes": "Warm, stormy, rain-splashed environments; contaminated seeds.",
                "affected_parts": "Foliage, flowers (causing blossom abortion), fruit (scabby raised lesions)",
                "risk": "High in warm humid agricultural regions."
            },
            {
                "name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
                "pathogen": "Begomovirus (transmitted by Bemisia tabaci whiteflies)",
                "symptoms": "Severe stunting, erect/upward cupping of leaflets, chlorotic margins, flower abortion.",
                "causes": "Whitefly feeding infestations in warm weather.",
                "affected_parts": "Upper terminal shoots, whole canopy growth",
                "risk": "Severe; can cause up to 100% yield loss when young plants are infected."
            }
        ],
        "common_pests": [
            {"name": "Whiteflies", "damage": "Sap-sucking vector for TYLCV, secretes honeydew leading to sooty mold."},
            {"name": "Tomato Hornworm", "damage": "Rapid defoliation of leaves and deep cavities in green fruit."},
            {"name": "Two-Spotted Spider Mites", "damage": "Stippling and fine webbing under leaf surfaces during hot, dusty weather."},
            {"name": "Fruit Borer / Helicoverpa", "damage": "Caterpillar bores circular entry holes into fruit."}
        ],
        "sustainable_care": [
            "Install drip irrigation at ground level with organic straw or woven fabric mulch to prevent soil splashing onto lower leaves.",
            "Maintain wide plant spacing (50-60 cm) and stake or cage plants to promote vigorous air circulation and accelerate foliage drying.",
            "Implement a strict 3-to-4 year crop rotation away from other solanaceous crops (potato, pepper, eggplant).",
            "Introduce beneficial biological control agents such as Trichoderma viride in the root zone and Encarsia formosa wasps for whitefly suppression.",
            "Promptly sanitize pruning shears with 70% isopropyl alcohol and prune lower leaves below the lowest fruit cluster once mature."
        ]
    },

    "Potato": {
        "name": "Potato",
        "scientific_name": "Solanum tuberosum",
        "family": "Solanaceae",
        "description": "Cool-climate subterranean tuber crop, sensitive to water stress during tuber initiation and highly susceptible to foliar blights.",
        "growth_cycle_days": "90 - 120 days",
        "optimal_climate": {
            "temperature": "15°C - 20°C (cool days and nights for tuber bulking)",
            "soil_ph": "5.0 - 6.5 (slightly acidic discourages common scab)",
            "sunlight": "Full sun, 6+ hours daily",
            "water_needs": "1.0 - 2.0 inches per week, critical at tuber initiation"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "Sprout Development & Emergence",
                "duration_days": "14 - 25 days",
                "description": "Seed potato eyes sprout, growing upwards through soil; roots emerge from base of sprouts.",
                "what_is_happening": "Stored carbohydrate remobilization from seed tuber piece.",
                "farmer_monitoring": "Inspect seed pieces for soft rot (Pectobacterium) or Rhizoctonia stem canker.",
                "care_considerations": "Plant certified disease-free seed tubers in loose, well-drained, aerated ridges.",
                "next_stage": "Vegetative Canopy & Lateral Stems"
            },
            {
                "stage_number": 2,
                "name": "Vegetative Canopy & Lateral Stems",
                "duration_days": "25 - 35 days",
                "description": "Aboveground canopy establishes dense leafy stems; stolons initiate underground.",
                "what_is_happening": "Maximum photosynthetic surface synthesis.",
                "farmer_monitoring": "Scout for Colorado Potato Beetle eggs and early flea beetle pitting on leaves.",
                "care_considerations": "Hill up soil around stems to prevent sunlight from greening developing stolons.",
                "next_stage": "Tuber Initiation"
            },
            {
                "stage_number": 3,
                "name": "Tuber Initiation",
                "duration_days": "10 - 15 days",
                "description": "Stolon tips swell to form miniature tubers; flowers may begin to bud.",
                "what_is_happening": "Hormonal shift directing photosynthetic assimilates to underground storage sinks.",
                "farmer_monitoring": "Check soil moisture precisely; moisture stress at this stage severely reduces tuber count.",
                "care_considerations": "Ensure uniform soil moisture; avoid soil drying and over-fertilizing with nitrogen.",
                "next_stage": "Tuber Bulking"
            },
            {
                "stage_number": 4,
                "name": "Tuber Bulking",
                "duration_days": "35 - 50 days",
                "description": "Tubers rapidly enlarge, accumulating starch, minerals, and water.",
                "what_is_happening": "Major storage phase; leaves supply high volumes of carbohydrates.",
                "farmer_monitoring": "Monitor aggressively for Late Blight (Phytophthora) lesions on foliage and stems.",
                "care_considerations": "Keep ridges well covered with soil to protect tubers from blight spores washing down with rain.",
                "next_stage": "Maturation & Vine Senescence"
            },
            {
                "stage_number": 5,
                "name": "Maturation & Vine Senescence",
                "duration_days": "15 - 20 days",
                "description": "Vines naturally turn yellow and die back; tuber skins thicken ('skin set').",
                "what_is_happening": "Starch consolidation and periderm suberization for long-term storage shelf life.",
                "farmer_monitoring": "Allow 10-14 days after vine death for skin hardening before digging to prevent peel slip.",
                "care_considerations": "Cease irrigation. Harvest during dry conditions with padded equipment to avoid bruising.",
                "next_stage": "Curing & Storage"
            }
        ],
        "common_diseases": [
            {
                "name": "Late Blight",
                "pathogen": "Phytophthora infestans",
                "symptoms": "Dark brown greasy water-soaked leaf lesions, white spore ring on underside, rotting tubers with rusty-brown granular flesh.",
                "causes": "Prolonged cool wet weather, infected volunteer tubers.",
                "affected_parts": "Canopy foliage, stems, storage tubers",
                "risk": "Catastrophic if uncontained."
            },
            {
                "name": "Early Blight",
                "pathogen": "Alternaria solani",
                "symptoms": "Concentric ring spots on older lower leaves, brown sunken dry lesions.",
                "causes": "Plant stress, nutrient deficiency, alternating wet/dry conditions.",
                "affected_parts": "Leaves and stems",
                "risk": "Moderate to high; reduces photosynthetic capacity."
            },
            {
                "name": "Blackleg & Soft Rot",
                "pathogen": "Pectobacterium & Dickeya species (Bacteria)",
                "symptoms": "Inky black stem rot starting at soil line, slimy foul-smelling tuber rot.",
                "causes": "Waterlogged soil, contaminated machinery, warm wet conditions.",
                "affected_parts": "Stems and tubers",
                "risk": "High in saturated soils."
            }
        ],
        "common_pests": [
            {"name": "Colorado Potato Beetle", "damage": "Voracious chewing larvae and adults strip canopy foliage."},
            {"name": "Potato Leafhopper", "damage": "Causes hopperburn (V-shaped leaf yellowing and edge browning)."},
            {"name": "Wireworms", "damage": "Larvae tunnel holes through underground tubers."}
        ],
        "sustainable_care": [
            "Use certified pathogen-tested seed potatoes to prevent introduction of viral and bacterial seed-borne diseases.",
            "Maintain generous hilling ridges with minimum 10-15 cm soil cover over tubers to block sunlight and prevent blight spore penetration.",
            "Apply Bacillus amyloliquefaciens or Trichoderma biocontrols into furrows at planting to suppress soil-borne fungal pathogens.",
            "Rotate potato fields on a minimum 3-year cycle with non-solanaceous grass or legume cover crops."
        ]
    },

    "Rice (Paddy)": {
        "name": "Rice (Paddy)",
        "scientific_name": "Oryza sativa",
        "family": "Poaceae",
        "description": "Primary global staple cereal grain cultivated predominantly in flooded lowland paddies or rainfed uplands.",
        "growth_cycle_days": "105 - 150 days",
        "optimal_climate": {
            "temperature": "20°C - 35°C (high heat and humidity tolerant)",
            "soil_ph": "5.5 - 6.5 (clay or clay loam with high water holding capacity)",
            "sunlight": "High solar radiation during reproductive and ripening phases",
            "water_needs": "Continuous shallow standing water (2-5 cm) or Alternate Wetting and Drying (AWD)"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "Germination & Seedling Nursery",
                "duration_days": "15 - 25 days",
                "description": "Coleoptile and radicle emerge; seedlings develop 3-4 leaves in nursery bed.",
                "what_is_happening": "Establishment of primary root and initial photosynthetic shoots.",
                "farmer_monitoring": "Check nursery for Brown Spot (Bipolaris) and damping-off; monitor water depth.",
                "care_considerations": "Maintain shallow water layer (1-2 cm) to keep soil moist without submerging seedlings.",
                "next_stage": "Tillering & Vegetative Expansion"
            },
            {
                "stage_number": 2,
                "name": "Tillering & Vegetative Expansion",
                "duration_days": "30 - 45 days",
                "description": "Transplanted seedlings produce auxiliary vegetative shoots (tillers) from base.",
                "what_is_happening": "Rapid tiller multiplication, root network anchoring deep in anaerobic mud layer.",
                "farmer_monitoring": "Scout for Yellow Stem Borer dead hearts and Leaf Folder folded leaf damage.",
                "care_considerations": "Manage shallow standing water, apply split nitrogen doses to maximize productive tillers.",
                "next_stage": "Stem Elongation & Panicle Initiation"
            },
            {
                "stage_number": 3,
                "name": "Stem Elongation & Panicle Initiation",
                "duration_days": "15 - 20 days",
                "description": "Internodes elongate rapidly; embryonic panicle forms at the growing shoot apex.",
                "what_is_happening": "Transition from vegetative to reproductive phase; prospective grain count determined.",
                "farmer_monitoring": "Inspect stem bases for Sheath Blight (Rhizoctonia) lesions and Rice Blast spots.",
                "care_considerations": "Ensure unhindered water availability; water deficit here induces spikelet sterility.",
                "next_stage": "Booting & Heading (Anthesis)"
            },
            {
                "stage_number": 4,
                "name": "Booting & Heading (Anthesis)",
                "duration_days": "10 - 15 days",
                "description": "The flag leaf sheath swells (booting) and panicles emerge (heading); flowers open for pollination.",
                "what_is_happening": "Self-pollination occurs within hours of spikelet opening.",
                "farmer_monitoring": "Check for Brown Planthopper (BPH) at stem bases and Bacterial Leaf Blight on flag leaves.",
                "care_considerations": "Protect flag leaf at all costs; it contributes up to 60-70% of final grain filling carbohydrates.",
                "next_stage": "Grain Filling (Milk to Dough Stage)"
            },
            {
                "stage_number": 5,
                "name": "Grain Filling (Milk to Dough Stage)",
                "duration_days": "20 - 30 days",
                "description": "Caryopsis accumulates starch, passing from watery milk to firm soft-dough and hard-dough consistency.",
                "what_is_happening": "Panicles bend downwards under increasing grain weight; green hulls turn golden yellow.",
                "farmer_monitoring": "Scout for Rice Bug (Gundhi bug) sucking milk-stage sap, causing empty / pecky grains.",
                "care_considerations": "Begin gradual drainage of paddy field 10-14 days before harvest.",
                "next_stage": "Ripening & Harvest"
            },
            {
                "stage_number": 6,
                "name": "Ripening & Harvest",
                "duration_days": "10 - 15 days",
                "description": "Grains reach 80-85% golden maturity; moisture drops to 20-22% suitable for combine or sickle harvest.",
                "what_is_happening": "Complete moisture reduction and dormancy stabilization.",
                "farmer_monitoring": "Avoid harvest delays that increase shatter loss, lodging, or grain cracking.",
                "care_considerations": "Dry paddy grain down to 14% moisture immediately after threshing for safe long-term storage.",
                "next_stage": "Post-Harvest Residue Management"
            }
        ],
        "common_diseases": [
            {
                "name": "Rice Blast",
                "pathogen": "Magnaporthe oryzae (Fungus)",
                "symptoms": "Spindle-shaped diamond lesions with gray centers and brown borders on leaves; neck blast causes broken panicles and white heads.",
                "causes": "High relative humidity (>90%), leaf wetness, excessive nitrogen fertilizer.",
                "affected_parts": "Leaves, collars, panicle necks, seeds",
                "risk": "Severe; can destroy whole crops under epidemic conditions."
            },
            {
                "name": "Bacterial Leaf Blight (BLB)",
                "pathogen": "Xanthomonas oryzae pv. oryzae",
                "symptoms": "Water-soaked streaks starting at leaf tips, extending down margins into wavy yellow-white bleached blighted stripes with milky bacterial ooze beads.",
                "causes": "Wind, rain storms, deep standing water, clipping seedling tips.",
                "affected_parts": "Leaf blades and sheaths",
                "risk": "High in typhoon/cyclone belts."
            },
            {
                "name": "Sheath Blight",
                "pathogen": "Rhizoctonia solani",
                "symptoms": "Oval or snake-skin greenish-gray spots with brown borders on lower leaf sheaths near the water line.",
                "causes": "Dense plant stands, high humidity, warm temperature (28-32°C).",
                "affected_parts": "Lower sheaths and upper leaves",
                "risk": "Moderate to high; causes lodging."
            }
        ],
        "common_pests": [
            {"name": "Brown Planthopper (BPH)", "damage": "Sucks phloem sap at stem base causing 'hopper burn' patches of dry lodged crop."},
            {"name": "Yellow Stem Borer", "damage": "Caterpillar bores into stem causing deadhearts in vegetative stage and whiteheads at maturity."},
            {"name": "Rice Leaf Folder", "damage": "Larvae fold leaf margins with silk threads and scrape chlorophyll from inside."}
        ],
        "sustainable_care": [
            "Adopt Alternate Wetting and Drying (AWD) water management to save 20-30% water, cut methane emissions, and reduce BPH pest pressure.",
            "Balance fertilizer application: avoid excessive early nitrogen; apply potassium and silicon to strengthen silica cell walls against blast and pests.",
            "Conserve natural predators such as wolf spiders (Lycosa pseudoannulata), mirid bugs, and dragonflies by avoiding prophylactic broad-spectrum insecticide sprays.",
            "Incorporate rice straw back into the soil with Trichoderma decomposers rather than burning field residues."
        ]
    },

    "Corn (Maize)": {
        "name": "Corn (Maize)",
        "scientific_name": "Zea mays",
        "family": "Poaceae",
        "description": "High-efficiency C4 cereal grain characterized by prominent stalk architecture, separate male (tassel) and female (ear) inflorescences.",
        "growth_cycle_days": "90 - 130 days",
        "optimal_climate": {
            "temperature": "20°C - 30°C",
            "soil_ph": "5.8 - 7.0 (rich fertile loam with high organic matter)",
            "sunlight": "Full sun, high photosynthesis demand",
            "water_needs": "18 - 24 inches total water over growing season"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "VE to V2 (Emergence & Early Seedling)",
                "duration_days": "10 - 15 days",
                "description": "Coleoptile pierces soil surface; first and second leaves with collars visible.",
                "what_is_happening": "Root system shifts from seminal seed roots to nodal crown roots.",
                "farmer_monitoring": "Check emergence uniformity; scout for wireworms, cutworms, and seedling blights.",
                "care_considerations": "Ensure proper planting depth (4-5 cm) to establish robust nodal root anchor zone.",
                "next_stage": "V3 to V8 (Rapid Vegetative)"
            },
            {
                "stage_number": 2,
                "name": "V3 to V8 (Rapid Vegetative)",
                "duration_days": "20 - 25 days",
                "description": "Leaf collars multiply; growing point moves above soil line; prospective ear size initiated internally.",
                "what_is_happening": "Maximum vegetative root exploration and rapid nitrogen uptake.",
                "farmer_monitoring": "Scout for Fall Armyworm whorl feeding and early signs of Northern Corn Leaf Blight.",
                "care_considerations": "Side-dress nitrogen application during peak demand; control competing weeds before canopy closure.",
                "next_stage": "V12 to VT (Tasseling)"
            },
            {
                "stage_number": 3,
                "name": "V12 to VT (Tasseling)",
                "duration_days": "15 - 20 days",
                "description": "Tassel emerges completely at apex; stalks reach maximum vegetative height.",
                "what_is_happening": "Pollen preparation inside anthers.",
                "farmer_monitoring": "Monitor soil moisture intensely; water stress at this stage severely hampers pollination.",
                "care_considerations": "Maintain adequate irrigation; check for Common Rust pustules on upper leaves.",
                "next_stage": "R1 (Silking)"
            },
            {
                "stage_number": 4,
                "name": "R1 (Silking)",
                "duration_days": "7 - 10 days",
                "description": "Silks emerge from the husks; pollen grains shed from tassel land on moist silks to fertilize ovules.",
                "what_is_happening": "Pollen tubes grow down silks within 24 hours to fertilize potential kernels.",
                "farmer_monitoring": "Look for Japanese beetles or Corn Earworm moths clipping silks before pollination finishes.",
                "care_considerations": "Extreme heat (>35°C) can desiccate silks; irrigate if available to cool microclimate.",
                "next_stage": "R2 to R3 (Blister to Milk Stage)"
            },
            {
                "stage_number": 5,
                "name": "R2 to R3 (Blister to Milk Stage)",
                "duration_days": "15 - 20 days",
                "description": "Kernels look like white blisters containing clear fluid (R2), then fill with sweet milky white starch (R3).",
                "what_is_happening": "Rapid starch conversion and embryo differentiation.",
                "farmer_monitoring": "Scout for Ear Rot fungi (Fusarium, Gibberella) and ear borer entry.",
                "care_considerations": "Maintain moisture; sweet corn is harvested at R3 milk stage for consumption.",
                "next_stage": "R4 to R5 (Dough to Dent Stage)"
            },
            {
                "stage_number": 6,
                "name": "R4 to R5 (Dough to Dent Stage)",
                "duration_days": "20 - 25 days",
                "description": "Kernel fluid turns into dough; dent forms on crown of kernel as hard starch accumulates.",
                "what_is_happening": "Dry matter accumulation progresses from crown toward kernel base (the 'milk line').",
                "farmer_monitoring": "Track milk line progression down kernel face to assess maturity timeline.",
                "care_considerations": "Foliar disease at this stage can still decrease test weight.",
                "next_stage": "R6 (Physiological Maturity & Black Layer)"
            },
            {
                "stage_number": 7,
                "name": "R6 (Physiological Maturity & Black Layer)",
                "duration_days": "10 - 20 days",
                "description": "Black abscission layer forms at kernel tip; dry matter accumulation ceases completely.",
                "what_is_happening": "Grain dries naturally in field from ~30% moisture down to 15-18% harvest moisture.",
                "farmer_monitoring": "Check stalk strength (push test) to detect stalk rots that could cause field lodging.",
                "care_considerations": "Harvest promptly once grain moisture is economical for drying or storage.",
                "next_stage": "Post-Harvest Field Management"
            }
        ],
        "common_diseases": [
            {
                "name": "Northern Corn Leaf Blight (NCLB)",
                "pathogen": "Exserohilum turcicum (Fungus)",
                "symptoms": "Long, elliptical, cigar-shaped grayish-green to tan lesions (2.5 to 15 cm long) on foliage.",
                "causes": "Moderate temperatures (18-27°C), heavy dew, continuous corn cropping.",
                "affected_parts": "Leaves and occasionally outer ear husks",
                "risk": "High if infection occurs before or at silking."
            },
            {
                "name": "Common Rust",
                "pathogen": "Puccinia sorghi",
                "symptoms": "Small, oval, brownish-red powdery pustules scattered over both upper and lower leaf surfaces.",
                "causes": "Cool temperatures (15-22°C), high relative humidity.",
                "affected_parts": "All foliage",
                "risk": "Moderate; usually stays restricted unless conditions remain unseasonably cool."
            },
            {
                "name": "Gray Leaf Spot (GLS)",
                "pathogen": "Cercospora zeae-maydis",
                "symptoms": "Distinctly rectangular tan-to-gray spots bounded strictly by leaf veins.",
                "causes": "Warm humid conditions, minimum tillage with infected surface residue.",
                "affected_parts": "Lower leaves progressing upward to ear leaves",
                "risk": "High in continuous corn zero-till operations."
            }
        ],
        "common_pests": [
            {"name": "Fall Armyworm", "damage": "Chews ragged holes in whorl leaves and damages ear tips."},
            {"name": "Corn Earworm", "damage": "Feeds directly on developing kernels at ear tip, encouraging mold entry."},
            {"name": "European Corn Borer", "damage": "Tunnels inside stalks, causing stalk breakage and ear drop."}
        ],
        "sustainable_care": [
            "Rotate corn with nitrogen-fixing soybeans or winter legume cover crops to disrupt residue-borne fungal lifecycles.",
            "Apply split nitrogen applications (e.g. starter at planting + V6 side-dress) to minimize leaching and volatilization.",
            "Deploy pheromone traps to monitor Fall Armyworm and Corn Earworm flights, timing biological Bt sprays effectively.",
            "Incorporate resistant hybrid cultivars with multi-gene resistance to NCLB and Gray Leaf Spot."
        ]
    },

    "Wheat": {
        "name": "Wheat",
        "scientific_name": "Triticum aestivum",
        "family": "Poaceae",
        "description": "Temperate cereal grain grown across global wheat belts, sensitive to heat stress during anthesis and foliar rusts.",
        "growth_cycle_days": "100 - 140 days (spring) / 200 - 250 days (winter)",
        "optimal_climate": {
            "temperature": "12°C - 22°C",
            "soil_ph": "6.0 - 7.5 (fertile, well-drained loam or clay loam)",
            "sunlight": "High light requirement",
            "water_needs": "12 - 18 inches total water"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "Germination & Seedling Emergence",
                "duration_days": "7 - 14 days",
                "description": "Radicle and coleoptile emerge; first 1-3 foliage leaves appear.",
                "what_is_happening": "Seminal root establishment; seedling anchors in soil.",
                "farmer_monitoring": "Check seedling stand uniformity; scout for wireworms and damping-off.",
                "care_considerations": "Drill into clean seedbed with adequate soil moisture at recommended seed depth (3-5 cm).",
                "next_stage": "Tillering"
            },
            {
                "stage_number": 2,
                "name": "Tillering & Crown Root Formation",
                "duration_days": "25 - 40 days",
                "description": "Crown produces lateral tillers; secondary adventitious root system develops.",
                "what_is_happening": "Head-bearing potential established; plants enter winter dormancy in winter wheat.",
                "farmer_monitoring": "Assess weed competition; scout for Aphids transmitting Barley Yellow Dwarf Virus (BYDV).",
                "care_considerations": "Apply primary nitrogen top-dress to encourage sturdy, productive tillering.",
                "next_stage": "Stem Extension (Jointing)"
            },
            {
                "stage_number": 3,
                "name": "Stem Extension (Jointing)",
                "duration_days": "15 - 20 days",
                "description": "Internodes elongate; first node becomes detectable just above soil surface.",
                "what_is_happening": "Embryonic wheat head moves upward inside stem; rapid nutrient and water uptake.",
                "farmer_monitoring": "Check lower leaves for Septoria tritici blotch and Powdery Mildew.",
                "care_considerations": "Apply second split nitrogen dose; ensure adequate moisture.",
                "next_stage": "Booting & Heading"
            },
            {
                "stage_number": 4,
                "name": "Booting & Heading",
                "duration_days": "10 - 15 days",
                "description": "Flag leaf sheath swells (boot); spike (head) emerges fully from collar.",
                "what_is_happening": "Head expands; floral structures mature.",
                "farmer_monitoring": "Inspect flag leaves for Stripe Rust (Yellow Rust) and Leaf Rust pustules.",
                "care_considerations": "Flag leaf provides over half of grain filling assimilates; protect foliage health.",
                "next_stage": "Anthesis & Flowering"
            },
            {
                "stage_number": 5,
                "name": "Anthesis & Flowering",
                "duration_days": "5 - 8 days",
                "description": "Anthers extrude from central spikelets; self-pollination takes place rapidly.",
                "what_is_happening": "Pollination and fertilization of florets; kernel count per spike finalized.",
                "farmer_monitoring": "Scout for Fusarium Head Blight (scab) during warm rainy weather at flowering.",
                "care_considerations": "Avoid heavy overhead irrigation during flowering to reduce Scab risk.",
                "next_stage": "Grain Filling (Milk to Dough)"
            },
            {
                "stage_number": 6,
                "name": "Grain Filling (Milk to Dough)",
                "duration_days": "25 - 35 days",
                "description": "Kernels fill with starch, transitioning from watery milk to firm soft and hard dough.",
                "what_is_happening": "Translocation of proteins and carbohydrates into wheat kernels.",
                "farmer_monitoring": "Watch for premature desiccation from hot dry winds (terminal heat stress).",
                "care_considerations": "Cease irrigation as crop matures.",
                "next_stage": "Maturity & Harvest"
            },
            {
                "stage_number": 7,
                "name": "Ripening & Harvest",
                "duration_days": "10 - 15 days",
                "description": "Plants turn golden straw color; grain moisture drops below 14% suitable for combining.",
                "what_is_happening": "Physiological grain dormancy and complete natural dry-down.",
                "farmer_monitoring": "Check grain moisture to avoid harvest delays that invite sprout damage.",
                "care_considerations": "Combine at optimum moisture (13-14%) to preserve test weight and baking quality.",
                "next_stage": "Stubble Management & Rotation"
            }
        ],
        "common_diseases": [
            {"name": "Stripe Rust (Yellow Rust)", "pathogen": "Puccinia striiformis", "symptoms": "Bright yellow pustules arranged in distinctive narrow stripes along leaf veins."},
            {"name": "Fusarium Head Blight", "pathogen": "Fusarium graminearum", "symptoms": "Bleached spikelets on green heads with pink/orange fungal spore masses."},
            {"name": "Septoria Tritici Blotch", "pathogen": "Zymoseptoria tritici", "symptoms": "Irregular tan lesions containing tiny black dots (pycnidia)."}
        ],
        "common_pests": [
            {"name": "Wheat Aphid", "damage": "Clusters on heads and leaves, transmitting viral pathogens and causing chlorosis."},
            {"name": "Army Cutworm", "damage": "Cuts young seedlings at soil line in early spring."}
        ],
        "sustainable_care": [
            "Maintain strict rotation with broadleaf crops (canola, pulses) to break cereal fungal pathogen carryover.",
            "Select resistant wheat cultivars adapted to regional rust strains.",
            "Use split nitrogen top-dressing aligned with plant phenology (jointing and booting stages)."
        ]
    },

    "Bell Pepper": {
        "name": "Bell Pepper",
        "scientific_name": "Capsicum annuum",
        "family": "Solanaceae",
        "description": "Warm-season vegetable producing crisp sweet hollow fruits, susceptible to blossom end rot and bacterial spots.",
        "growth_cycle_days": "70 - 90 days from transplanting",
        "optimal_climate": {
            "temperature": "21°C - 28°C",
            "soil_ph": "6.0 - 6.8",
            "sunlight": "Full sun",
            "water_needs": "1.0 - 1.5 inches per week; steady drip irrigation"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "Seedling Emergence & Establishment",
                "duration_days": "15 - 25 days",
                "description": "Cotyledons and first true leaves develop in nursery trays.",
                "what_is_happening": "Initial root initialization; slow early growth phase.",
                "farmer_monitoring": "Check damping-off and root temperature.",
                "care_considerations": "Warm root zone (24°C) essential for vigorous germination.",
                "next_stage": "Vegetative Canopy"
            },
            {
                "stage_number": 2,
                "name": "Vegetative Canopy & Branching",
                "duration_days": "25 - 35 days",
                "description": "Plant forms a strong central stem with dichotomous branching; dark green foliage expands.",
                "what_is_happening": "Structural framework establishment to support heavy fruit load.",
                "farmer_monitoring": "Scout for aphids, thrips, and Broad Mite leaf curling.",
                "care_considerations": "Stake plants early; pepper branches are brittle and prone to snapping.",
                "next_stage": "Flowering & Anthesis"
            },
            {
                "stage_number": 3,
                "name": "Flowering & Anthesis",
                "duration_days": "15 - 20 days",
                "description": "White star-shaped flowers open at branch junctions; self-pollination occurs.",
                "what_is_happening": "Pollination and fertilization; temperatures >30°C cause blossom drop.",
                "farmer_monitoring": "Monitor floral abortion; inspect for flower thrips.",
                "care_considerations": "Maintain uniform soil moisture; supply soluble calcium to guard against blossom end rot.",
                "next_stage": "Fruit Enlargement (Green Stage)"
            },
            {
                "stage_number": 4,
                "name": "Fruit Enlargement (Green Stage)",
                "duration_days": "25 - 35 days",
                "description": "Thick-walled green blocky fruits enlarge rapidly to mature size.",
                "what_is_happening": "Cellular expansion and pericarp wall thickening.",
                "farmer_monitoring": "Check fruit blossom ends for sunken black leathery spots (Blossom End Rot).",
                "care_considerations": "Maintain consistent drip irrigation; avoid drought cycles.",
                "next_stage": "Color Break & Ripening"
            },
            {
                "stage_number": 5,
                "name": "Color Break & Ripening",
                "duration_days": "15 - 25 days",
                "description": "Chlorophyll degrades, fruit turns bright red, yellow, or orange depending on cultivar.",
                "what_is_happening": "Vitamin C and sugar accumulation; softening of fruit walls.",
                "farmer_monitoring": "Scout for Anthracnose circular fruit lesions and sunscald.",
                "care_considerations": "Harvest with sharp shears leaving short stem attached.",
                "next_stage": "Post-Harvest Sanitation"
            }
        ],
        "common_diseases": [
            {"name": "Bacterial Spot", "pathogen": "Xanthomonas campestris pv. vesicatoria", "symptoms": "Small brown water-soaked lesions with yellow halos on leaves; raised warty spots on fruit."},
            {"name": "Phytophthora Blight", "pathogen": "Phytophthora capsici", "symptoms": "Dark brown stem girdling at soil line, rapid wilt, white yeast-like mold on fruit."},
            {"name": "Anthracnose", "pathogen": "Colletotrichum species", "symptoms": "Circular sunken water-soaked spots on ripening fruit with pink/orange gelatinous spore rings."}
        ],
        "common_pests": [
            {"name": "Pepper Thrips", "damage": "Feeds in flowers and leaves, causing leaf distortion and vectoring TSWV."},
            {"name": "Broad Mites", "damage": "Microscopic pests causing downward cupping, thick leathery foliage."}
        ],
        "sustainable_care": [
            "Mulch beds with straw or reflective plastic to suppress weeds, retain moisture, and repel thrips.",
            "Install drip irrigation directly beneath mulch; avoid all overhead sprinkler watering.",
            "Rotate beds with non-solanaceous crops on a 3-year interval.",
            "Deploy yellow sticky traps for monitoring whiteflies and blue sticky traps for thrips."
        ]
    },

    "Apple": {
        "name": "Apple",
        "scientific_name": "Malus domestica",
        "family": "Rosaceae",
        "description": "Deciduous orchard tree crop requiring winter chilling hours, highly susceptible to foliar and fruit fungal blights.",
        "growth_cycle_days": "Perennial; fruit development 120 - 160 days post-bloom",
        "optimal_climate": {
            "temperature": "Temperate with 500-1000 winter chill hours (<7°C)",
            "soil_ph": "6.0 - 7.0 (well-drained loam without hardpan)",
            "sunlight": "Full sun, open canopy",
            "water_needs": "Consistent orchard irrigation, especially during fruit sizing"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "Dormant to Bud Swell & Green Tip",
                "duration_days": "15 - 25 days",
                "description": "Winter buds swell; green leaf tissue begins to show at bud tips.",
                "what_is_happening": "Hormonal awakening as chilling requirement is satisfied and spring temperatures rise.",
                "farmer_monitoring": "Scout for overwintering Scale insects, European Red Mite eggs, and Apple Scab ascospore release.",
                "care_considerations": "Apply dormant horticultural oil spray if needed before bud burst.",
                "next_stage": "Tight Cluster & Pink Bud"
            },
            {
                "stage_number": 2,
                "name": "Tight Cluster & Pink Bud",
                "duration_days": "10 - 15 days",
                "description": "Flower blossom buds cluster tightly and separate, showing pink/white petals.",
                "what_is_happening": "Flower reproductive structures develop; high susceptibility to frost damage.",
                "farmer_monitoring": "Scout for Rosy Apple Aphids and monitor weather forecasts for spring freeze events.",
                "care_considerations": "Protect against primary Apple Scab infections following rainfall events.",
                "next_stage": "Full Bloom & Pollination"
            },
            {
                "stage_number": 3,
                "name": "Full Bloom & Pollination",
                "duration_days": "7 - 12 days",
                "description": "Flowers fully expand; honeybees and native solitary bees cross-pollinate blossoms.",
                "what_is_happening": "Pollen transfer between compatible cross-pollinating apple cultivars.",
                "farmer_monitoring": "Check Fire Blight infection risk models (Maryblyt / Cougarblight) if warm rains occur.",
                "care_considerations": "Never spray insecticides during active bloom to protect pollinating bees.",
                "next_stage": "Petal Fall & Fruit Set"
            },
            {
                "stage_number": 4,
                "name": "Petal Fall & Fruit Set",
                "duration_days": "10 - 14 days",
                "description": "Petals drop; fertilized flower receptacles swell into miniature green apples.",
                "what_is_happening": "Cell division phase within the apple flesh cortex.",
                "farmer_monitoring": "Scout for Plum Curculio crescent scars and Codling Moth egg lay.",
                "care_considerations": "Perform chemical or manual fruitlet thinning to leave 1 fruit per cluster for size.",
                "next_stage": "Fruit Growth & Cell Enlargement"
            },
            {
                "stage_number": 5,
                "name": "Fruit Growth & Cell Enlargement",
                "duration_days": "60 - 90 days",
                "description": "Apples swell steadily in size; canopy foliage maintains photosynthetic sugar factory.",
                "what_is_happening": "Carbohydrate and water accumulation in fruit cells.",
                "farmer_monitoring": "Check fruit for Bitter Pit (calcium imbalance), Cedar Apple Rust galls, and secondary Scab.",
                "care_considerations": "Apply foliar calcium sprays throughout sizing phase; manage summer pruning for light penetration.",
                "next_stage": "Maturity & Harvest"
            },
            {
                "stage_number": 6,
                "name": "Maturity & Harvest",
                "duration_days": "20 - 30 days",
                "description": "Starch-to-sugar conversion, background skin color changes from green to yellow/red.",
                "what_is_happening": "Ethylene emission, seed coat browning, aromatic ester synthesis.",
                "farmer_monitoring": "Test fruit firmness with penetrometer and starch iodine index before picking.",
                "care_considerations": "Hand-pick gently into padded bins without bruising; cool rapidly to 0-2°C for cold storage.",
                "next_stage": "Post-Harvest Orchard Care"
            }
        ],
        "common_diseases": [
            {"name": "Apple Scab", "pathogen": "Venturia inaequalis", "symptoms": "Olive-green to velvety brown-black corky lesions on leaves and scabby deformed fruit."},
            {"name": "Black Rot", "pathogen": "Botryosphaeria obtusa", "symptoms": "'Frog-eye' circular spots on leaves; firm dry rotting mummified fruit with black pustules."},
            {"name": "Cedar Apple Rust", "pathogen": "Gymnosporangium juniperi-virginianae", "symptoms": "Bright yellow-orange spots on upper leaf surfaces with gelatinous rust tubes underneath."},
            {"name": "Fire Blight", "pathogen": "Erwinia amylovora (Bacteria)", "symptoms": "Blossoms and shoots turn black and shrivel, forming a characteristic 'shepherd's crook'."}
        ],
        "common_pests": [
            {"name": "Codling Moth", "damage": "Caterpillar bores through calyx into core to feed on seeds, leaving brown frass."},
            {"name": "Apple Maggot", "damage": "Flies oviposit beneath skin; maggots tunnel winding brown trails through fruit flesh."}
        ],
        "sustainable_care": [
            "Rake and shred or compost fallen autumn leaves, or apply 5% urea spray at leaf fall to accelerate decomposition and reduce overwintering Apple Scab ascospores.",
            "Prune trees during winter dormancy to maintain an open canopy that allows rapid wind-drying of foliage and thorough sunlight penetration.",
            "Deploy Codling Moth mating disruption pheromone dispensers throughout the orchard perimeter.",
            "Encourage orchard floor ground covers (clover, perennial fescue) to habitat beneficial predatory mites (Typhlodromus pyri)."
        ]
    },

    "Grape": {
        "name": "Grape",
        "scientific_name": "Vitis vinifera",
        "family": "Vitaceae",
        "description": "Perennial climbing woody vine producing cluster berries for table fruit, raisins, and viniculture.",
        "growth_cycle_days": "Perennial vine; annual vegetative and reproductive cycle ~150 - 180 days",
        "optimal_climate": {
            "temperature": "15°C - 32°C (warm dry summers, mild winters)",
            "soil_ph": "5.5 - 7.0 (gravelly, well-drained slopes preferred)",
            "sunlight": "Full sun, maximum exposure",
            "water_needs": "Regulated Deficit Irrigation (RDI) to manage berry size and vigor"
        },
        "growth_stages": [
            {
                "stage_number": 1,
                "name": "Winter Dormancy to Bud Break",
                "duration_days": "15 - 25 days",
                "description": "Vines weep sap; compound buds swell and first young green woolly shoot tips push out.",
                "what_is_happening": "Root pressure mobilizes carbohydrate reserves up the vine trunk.",
                "farmer_monitoring": "Check for Cutworms chewing young buds and monitor for Phomopsis cane lesions.",
                "care_considerations": "Complete winter cane or spur pruning; tie cordons securely to trellis wires.",
                "next_stage": "Rapid Shoot Growth & Inflorescence"
            },
            {
                "stage_number": 2,
                "name": "Rapid Shoot Growth & Inflorescence",
                "duration_days": "25 - 35 days",
                "description": "Shoots lengthen rapidly; miniature flower clusters (inflorescences) separate on new shoots.",
                "what_is_happening": "Rapid leaf expansion; tendrils latch onto trellis catch wires.",
                "farmer_monitoring": "Scout for Powdery Mildew flag shoots and Black Rot leaf spots.",
                "care_considerations": "Position shoots between canopy wires to maintain vertical canopy architecture.",
                "next_stage": "Flowering & Bloom"
            },
            {
                "stage_number": 3,
                "name": "Flowering & Bloom",
                "duration_days": "8 - 14 days",
                "description": "Flower caps (calyptra) detach; self-pollination takes place.",
                "what_is_happening": "Pollen shed and fertilization of ovules; berry set determined.",
                "farmer_monitoring": "Monitor weather: cool wet weather during bloom causes 'coulure' (poor fruit set).",
                "care_considerations": "Avoid heavy irrigation; protect against Downy Mildew and Powdery Mildew.",
                "next_stage": "Fruit Set & Berry Growth"
            },
            {
                "stage_number": 4,
                "name": "Fruit Set & Berry Growth (Pea-Size)",
                "duration_days": "30 - 45 days",
                "description": "Berries enlarge rapidly to pea-size, hard and dark green; clusters tighten.",
                "what_is_happening": "High organic acid accumulation; rapid cell division and enlargement.",
                "farmer_monitoring": "Scout for Grape Berry Moth webbing in clusters and Esca (Black Measles) tiger-stripe leaves.",
                "care_considerations": "Perform leaf pulling in the fruiting zone to expose clusters to morning sun and air.",
                "next_stage": "Veraison (Color Change & Softening)"
            },
            {
                "stage_number": 5,
                "name": "Veraison (Color Change & Softening)",
                "duration_days": "15 - 25 days",
                "description": "Berries soften; red varieties turn purple/black and white varieties turn translucent golden.",
                "what_is_happening": "Acids decline while glucose and fructose sugars rapidly accumulate.",
                "farmer_monitoring": "Check clusters for Botrytis bunch rot; install bird netting if birds target softening fruit.",
                "care_considerations": "Implement Regulated Deficit Irrigation (RDI) to concentrate flavors and polyphenols.",
                "next_stage": "Ripening & Harvest"
            },
            {
                "stage_number": 6,
                "name": "Ripening & Harvest",
                "duration_days": "20 - 30 days",
                "description": "Brix, pH, and titratable acidity reach target balance; seeds turn brown and woody.",
                "what_is_happening": "Flavor, anthocyanin, and aroma compound maturation.",
                "farmer_monitoring": "Sample daily for Brix sugar levels and inspect bunches for wasp feeding or sour rot.",
                "care_considerations": "Harvest cool in early morning or at night to preserve aroma volatiles and prevent oxidation.",
                "next_stage": "Post-Harvest Rest & Dormancy"
            }
        ],
        "common_diseases": [
            {"name": "Black Rot", "pathogen": "Guignardia bidwellii", "symptoms": "Reddish-brown leaf spots with black fruiting bodies; berries turn into shriveled, hard black mummies."},
            {"name": "Esca (Black Measles)", "pathogen": "Fomitiporia / Phaeomoniella complex", "symptoms": "Interveinal yellowing drying into tiger-stripe leaf patterns; dark purple spots on berry skins."},
            {"name": "Leaf Blight (Isariopsis)", "pathogen": "Pseudocercospora vitis", "symptoms": "Angular brown necrotic spots on foliage, causing premature defoliation."}
        ],
        "common_pests": [
            {"name": "Grape Leafhopper", "damage": "Punctures leaf cells, causing pale white stippling and reduced photosynthesis."},
            {"name": "Grape Berry Moth", "damage": "Caterpillars feed inside berries, spinning webbed clusters that attract Botrytis."}
        ],
        "sustainable_care": [
            "Perform selective leaf removal in the cluster zone immediately after fruit set to maximize air movement and reduce fungal humidity pockets.",
            "Protect pruning wounds during dry weather using biological Trichoderma paste to block trunk disease entry.",
            "Sow perennial native cover crops between vineyard rows to control vine vigor and provide habitat for predatory wasps."
        ]
    }
}

PEST_AND_DISEASE_FRAMEWORK: Dict[str, Any] = {
    "A_PREVENTIVE_METHODS": [
        {
            "category": "Certified Resistant Seeds & Planting Material",
            "guideline": "Always source certified disease-free and pathogen-tested seeds, seed tubers, and nursery rootstocks with verified resistance to common regional diseases."
        },
        {
            "category": "Strategic Crop Rotation",
            "guideline": "Rotate non-host crops on a 3 to 4 year cycle to exhaust soil-borne inoculum (e.g. solanaceous crops rotated with brassicas, legumes, or cereals)."
        },
        {
            "category": "Canopy Spacing & Sunlight Optimization",
            "guideline": "Maintain recommended plant and row spacing to ensure vigorous cross-ventilation, rapid morning foliage drying, and deep sunlight penetration."
        },
        {
            "category": "Field Sanitation & Crop Residue Management",
            "guideline": "Remove or deeply incorporate infected post-harvest crop debris. Disinfect pruning tools with 70% ethanol between plants to prevent mechanical transmission."
        }
    ],

    "B_NON_CHEMICAL_METHODS": [
        {
            "method": "Precision Drip Irrigation & Moisture Control",
            "description": "Deliver irrigation water at root level using drip lines or furrow channels. Strictly avoid overhead sprinkler watering to keep leaves dry."
        },
        {
            "method": "Organic Mulching & Splash Barriers",
            "description": "Apply clean straw, wood shavings, or biodegradable film mulch to cover bare soil, stopping rain-splash transmission of soil-borne fungal spores."
        },
        {
            "method": "Physical Barriers & Insect Exclusion",
            "description": "Deploy floating row covers, fine mesh insect screens, and pheromone/sticky traps to physically block vectors like whiteflies, thrips, and moths."
        },
        {
            "method": "Thermal Soil Solarization",
            "description": "Cover moist soil with clear polyethylene plastic for 4-6 weeks during peak summer sunshine to pasteurize soil and suppress nematodes and wilt pathogens."
        }
    ],

    "C_BIOLOGICAL_CONTROL_IPM": [
        {
            "pillar": "Beneficial Microbials & Biofungicides",
            "practices": [
                "Apply Trichoderma harzianum to the root zone and seedling nursery to parasitize pathogenic Rhizoctonia, Fusarium, and Pythium.",
                "Utilize Bacillus subtilis / Bacillus amyloliquefaciens foliar sprays to induce systemic acquired resistance (SAR) against foliar bacterial and fungal blights.",
                "Incorporate mycorrhizal fungal inoculants (VAM) to enhance root phosphorus uptake and drought resilience."
            ]
        },
        {
            "pillar": "Predatory Insects & Parasitoids",
            "practices": [
                "Preserve and release ladybird beetles (Coccinellidae) and green lacewings (Chrysoperla carnea) to naturally consume aphid and mite colonies.",
                "Release Encarsia formosa parasitic wasps to manage greenhouse whitefly infestations.",
                "Spray Bacillus thuringiensis (Bt kurstaki) for selective, non-toxic biological control of leaf-eating caterpillars."
            ]
        },
        {
            "pillar": "Economic Thresholds & Scouting",
            "practices": [
                "Conduct regular weekly scouting walks across fields in a zig-zag pattern.",
                "Only initiate active intervention when pest populations exceed established agronomic Economic Injury Levels (EIL)."
            ]
        }
    ],

    "D_CHEMICAL_TREATMENT_INFORMATION": {
        "CRITICAL_DISCLAIMER": (
            "IMPORTANT REGULATORY & SAFETY DIRECTIVE: "
            "Never automatically prescribe or apply a chemical pesticide solely from a photograph or automated scan. "
            "Appropriate and lawful chemical intervention strictly depends on: (1) Confirmed crop species and pathogen identity, "
            "(2) Disease incidence and severity threshold, (3) Crop growth stage and Days-to-Harvest (Pre-Harvest Interval - PHI), "
            "(4) Local climate and environmental sensitivity (e.g. proximity to water bodies and bee colonies), "
            "and (5) National and regional agricultural regulations. "
            "Always consult certified local agricultural extension specialists and read and follow the legally binding label instructions on locally registered products."
        ),
        "GENERAL_REGULATORY_CATEGORIES": [
            {
                "group": "Targeted Protective Fungicides",
                "notes": "Applied strictly when weather models indicate high disease infection risk, before lesions establish. Must rotate FRAC chemical groups to avoid pathogen resistance."
            },
            {
                "group": "Targeted Curative / Systemic Treatments",
                "notes": "Used only after expert laboratory confirmation when disease pressure exceeds economic threshold and non-chemical methods are inadequate."
            },
            {
                "group": "Safety & Pre-Harvest Intervals (PHI)",
                "notes": "Always strictly observe the mandatory re-entry intervals (REI) and pre-harvest intervals (PHI) to guarantee zero unsafe chemical residues on food produce."
            }
        ]
    }
}

def get_crop_knowledge(crop_name: str) -> Optional[Dict[str, Any]]:
    """Retrieve full crop knowledge profile by crop name."""
    for key, data in CROPS_DATABASE.items():
        if key.lower() in crop_name.lower() or crop_name.lower() in key.lower():
            return data
    return None

def get_all_supported_crops() -> List[Dict[str, Any]]:
    """Return summary list of all supported crops."""
    result = []
    for key, data in CROPS_DATABASE.items():
        result.append({
            "name": data["name"],
            "scientific_name": data["scientific_name"],
            "family": data["family"],
            "description": data["description"],
            "growth_cycle_days": data["growth_cycle_days"],
            "stages_count": len(data["growth_stages"]),
            "diseases_count": len(data["common_diseases"]),
            "pests_count": len(data["common_pests"])
        })
    return result
