//groupby
function groupby(list_a_grouper, champ_a_grouper) {
	let list_resultat_1 = []
	let list_resultat_2 = []
	let deduplicate_set
	for (row in list_a_grouper) {list_resultat_1.push(list_a_grouper[row][champ_a_grouper])}
	/*list_a_grouper.forEach((row)=> list_resultat_1.push(row[champ_a_grouper]));*/
	deduplicate_set = new Set(list_resultat_1)
	list_resultat_2 = Array.from(deduplicate_set)
	return list_resultat_2;
}


