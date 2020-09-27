//RG pour extraire la position de l'index de la catégorie et sous catégorie pour les bar groupés
var seg = "0-11" //ou seg est mon index composé
var pos_sep = seg.indexOf("-")  //où pos_sep est la position du '-'
var idx_Cat = seg.substring(0, pos_sep) //où idx_sCat est la valeur de ma catégorie
var idx_sousCat = seg.substring(pos_sep+1) //où idx_sousCat est la valeur de ma sous catégorie
//convertir les idx en int
idx_Cat = parseInt(idx_Cat)
idx_sousCat = parseInt(idx_sousCat)
