delogement_neuf = {
"o": "Oui",
"n": "Non"
}

detypedebien = {
"m":"Maison/Villa",
"ch":"Château",
"a":"Appartement",
"bu":"Bureau",
"h":"Hôtel particulier",
"mn":"Maison / Villa neuve",
"mn":"TerrainAvecMaison",
"l":"Loft/Atelier",
"d":"Divers",
"l":"Loft/Atelier/Surface",
"m":"Maison / Villa",
"bou":"Boutique",
"p":"Parking",
"ba":"Bâtiment",
"i":"Immeuble",
"t":"Terrain",
"an":"Appartement neuf",
"lc":"Local commercial"
}


decode_typedetransaction = {
"cdb":"Cession de bail",
"np":"Nue-propriété",
"pi":"Produit d’investissement",
"vfc":"Vente fonds de commerce",
"vp":"Vente de prestige",
"lt":"Location temporaire",
"l":"Location",
"v":"Vente",
"lv":"Location vacances",
"pi":"Produit d'investissement",
"vi":"Viager"
}

decode_categorie_annonceur = {
"a":"Agence",
"b":"broker",
"ca":"Constructeur appartements",
"cm":"Constructeur maisons",
"m":"Mandataire"
}



const array_decode_fields = [
{logement_neuf: {
"o": "Oui",
"n": "Non"}
},

{typedebien: {
"m":"Maison/Villa",
"ch":"Château",
"a":"Appartement",
"bu":"Bureau",
"h":"Hôtel particulier",
"mn":"Maison / Villa neuve",
"mn":"TerrainAvecMaison",
"l":"Loft/Atelier",
"d":"Divers",
"l":"Loft/Atelier/Surface",
"m":"Maison / Villa",
"bou":"Boutique",
"p":"Parking",
"ba":"Bâtiment",
"i":"Immeuble",
"t":"Terrain",
"an":"Appartement neuf",
"lc":"Local commercial"}
},


{typedetransaction: {
"cdb":"Cession de bail",
"np":"Nue-propriété",
"pi":"Produit d’investissement",
"vfc":"Vente fonds de commerce",
"vp":"Vente de prestige",
"lt":"Location temporaire",
"l":"Location",
"v":"Vente",
"lv":"Location vacances",
"pi":"Produit d'investissement",
"vi":"Viager"}
},

{categorie_annonceur: {
"a":"Agence",
"b":"broker",
"ca":"Constructeur appartements",
"cm":"Constructeur maisons",
"m":"Mandataire"}
}
]

var encoded_fields = [
	{logement_neuf: 'o', lib_logement_neuf: 'Oui'},
	{logement_neuf: 'n', lib_logement_neuf: 'Non'},
	{typedebien:  "m", lib_typedebien: "Maison/Villa"},
	{typedebien:  "ch", lib_typedebien: "Château"},
	{typedebien:  "a", lib_typedebien: "Appartement"},
	{typedebien:  "bu", lib_typedebien: "Bureau"},
	{typedebien:  "h", lib_typedebien: "Hôtel particulier"},
	{typedebien: "mn", lib_typedebien: "Maison / Villa neuve"},
	{typedebien: "mn", lib_typedebien: "TerrainAvecMaison"},
	{typedebien:  "l", lib_typedebien: "Loft/Atelier"},
	{typedebien:  "d", lib_typedebien: "Divers"},
	{typedebien:  "l", lib_typedebien: "Loft/Atelier/Surface"},
	{typedebien:  "m", lib_typedebien: "Maison / Villa"},
	{typedebien: "bou", lib_typedebien: "Boutique"},
	{typedebien:  "p", lib_typedebien: "Parking"},
	{typedebien:  "ba", lib_typedebien: "Bâtiment"},
	{typedebien:  "i", lib_typedebien: "Immeuble"},
	{typedebien:  "t", lib_typedebien: "Terrain"},
	{typedebien:  "an", lib_typedebien: "Appartement neuf"},
	{typedebien: "lc", lib_typedebien: "Local commercial"},
	{typedetransaction: "cdb", lib_typedetransaction: "Cession de bail"},
	{typedetransaction: "np", lib_typedetransaction: "Nue-propriété"},
	{typedetransaction: "pi", lib_typedetransaction: "Produit d’investissement"},
	{typedetransaction: "vfc", lib_typedetransaction: "Vente fonds de commerce"},
	{typedetransaction: "vp", lib_typedetransaction: "Vente de prestige"},
	{typedetransaction: "lt", lib_typedetransaction: "Location temporaire"},
	{typedetransaction: "l", lib_typedetransaction: "Location"},
	{typedetransaction: "v", lib_typedetransaction: "Vente"},
	{typedetransaction: "lv", lib_typedetransaction: "Location vacances"},
	{typedetransaction: "pi", lib_typedetransaction: "Produit d'investissement"},
	{typedetransaction: "vi", lib_typedetransaction: "Viager"},
	{categorie_annonceur: "a", lib_categorie_annonceur: "Agence"},
	{categorie_annonceur: "b", lib_categorie_annonceur: "broker"},
	{categorie_annonceur: "ca", lib_categorie_annonceur: "Constructeur appartements"},
	{categorie_annonceur: "cm", lib_categorie_annonceur: "Constructeur maisons"},
	{categorie_annonceur: "m", lib_categorie_annonceur: "Mandataire"},
	{categorie_annonceur: "cdb", lib_categorie_annonceur: "Cession de bail"}
]