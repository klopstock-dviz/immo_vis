  let ref_communes = []
  let communes_selected = []
  let data_annonces_details_ventes = [], data_stats_insee_com = [], ref_insee = [], data_stats_communes = []
  let polys = {}, poly_dep = {}, poly_com = {}
  let reg_Loaded_data_groupees = ["init"];
  let reg_Loaded_data_details = ["init"];

  var d1 = new Date();
  async function fetchData_refLiteCommunes() {
    let data1 = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/df_reference_communes_lite.csv");
    
    //df_global_1 = await data0
    
    for (row in data1) {
      ref_communes.push(data1[row]);
    };
    console.log((new Date() - d1)/1000)
  }
  fetchData_refLiteCommunes()

  async function fetchData_refCommunesIris() {
    //load data ref insee
    let rInsee = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/df_reference_communes_iris.csv");
    for (row in rInsee) {
        ref_insee.push(rInsee[row]);
    };
  } 
  fetchData_refCommunesIris()
  
  
async function chargerDataDetailleesCommunes() {
    //preloader
    document.getElementById("preloader_data1").style.display = "block"
    document.getElementById("preloader_data_comment").innerHTML = "Chargement des annonces"
    document.getElementById("preloader_data_comment").style.display = "block"


    var d1 = new Date();
    var limit = list_villes_selected.filter(r=> r.commune).length
    communes_selected = []; 

    for (i=0; i < limit; i++) {
      var code_dep = list_villes_selected[i].code_dep;
      communes_selected.push(list_villes_selected[i].code_commune)

      if (code_dep !== undefined && reg_Loaded_data_details.indexOf(code_dep) === -1) {
            try{ 
              let data_ventes = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/annonces_git/df_annonces_gps_iris_ventes_" + code_dep + ".csv");
              //let data_locations = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/annonces_git/df_annonces_gps_iris_locations_" + code_dep + ".csv");
              let data_stats_communes = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/insee/communes/base_cc_comparateur/base_cc_comparateur_" + code_dep + ".csv");
              

              var poly = await d3.json("https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/ref/polygons/polygones_" + code_dep + ".json");
              Object.assign(polys, poly)
              /*reg_Loaded_data_details.push(code_reg);*/
              console.log(code_dep)
              
              for (row in data_ventes) {
                data_annonces_details_ventes.push(data_ventes[row]);
              };

              for (row in data_stats_communes) {
                data_stats_insee_com.push(data_stats_communes[row]);
              };              
            }
            catch(error) {console.log(error)}
    }

    //convertir str en num
    data_annonces_details_ventes.forEach((d)=> 
    { d['nb_log_n7'] = +d['nb_log_n7']; d['surface'] = +d['surface']; d['prix_m2_vente'] = +d['prix_m2_vente']; d['nb_pieces'] = +d['nb_pieces'];
      d['surface_terrain'] = +d['surface_terrain']; d['prix_bien'] = +d['prix_bien']; d['prix_maison'] = +d['prix_maison'];
      d['prix_terrain'] = +d['prix_terrain']; d['mensualiteFinance'] = +d['mensualiteFinance']; d['balcon'] = +d['balcon'];
      d['eau'] = +d['eau']; d['bain'] = +d['bain']; d['dpeC'] = +d['dpeC'];
      d['mapCoordonneesLatitude'] = +d['mapCoordonneesLatitude']; d['mapCoordonneesLongitude'] = +d['mapCoordonneesLongitude']; d['nb_etages'] = +d['nb_etages'];
      d['places_parking'] = +d['places_parking']; d['annee_construction'] = +d['annee_construction']; d['nb_toilettes'] = +d['nb_toilettes'];
      d['nb_terraces'] = +d['nb_terraces']; d['nb_logements_copro'] = +d['nb_logements_copro']; d['charges_copro'] = +d['charges_copro'];
      d['loyer_m2_median_n6'] = +d['loyer_m2_median_n6']; d['nb_log_n6'] = +d['nb_log_n6']; d['taux_rendement_n6'] = +d['taux_rendement_n6'];
      d['loyer_m2_median_n7'] = +d['loyer_m2_median_n7']; d['taux_rendement_n7'] = +d['taux_rendement_n7']; d['flag_ligne'] = 1;
     })

    var fields_to_num = ['P17_POP', 'P12_POP',  'SUPERF',   'NAIS1217', 'DECE1217', 'P17_MEN',  'NAISD19',  'DECESD19', 'P17_LOG',  'P17_RP',   'P17_RSECOCC',  'P17_LOGVAC',   'P17_RP_PROP',  'NBMENFISC17',  'PIMP17',   'MED17',    'TP6017',   'P17_EMPLT',    'P17_EMPLT_SAL',    'P12_EMPLT',    'P17_POP1564',  'P17_CHOM1564', 'P17_ACT1564',  'ETTOT15',  'ETAZ15',   'ETBE15',   'ETFZ15',   'ETGU15',   'ETGZ15',   'ETOQ15',   'ETTEF115', 'ETTEFP1015']

    data_stats_insee_com.forEach((d)=> 
    { 
        fields_to_num.map(field=> { d[field] = +d[field] })
     })    

    data_annonces_details_ventes_filtre_communes = [...data_annonces_details_ventes]

  }


  console.log("chargement data detaillées en: " + (new Date() - d1)/1000)

  

  document.getElementById("preloader_data_comment").style.display = "none"
  document.getElementById("preloader_data_comment").innerHTML = ""
  document.getElementById("preloader_data1").style.display = "none"


  //update
  if (sharedParams.setup_graphics === true) {
    sharedParams.transformations.filter.filter(f=> f.field === "INSEE_COM")[0].values = communes_selected
    updateCharts(sharedParams)
  }
  //create
  else {
    setup_graphics(communes_selected)
    sharedParams.setup_graphics = true
  }


  
}



  async function chargerDataRegroupeesCommunes() {

    //preloader
    document.getElementById("preloader_data1").style.display = "block"
    document.getElementById("preloader_data_comment").innerHTML = "Chargement annonces groupées"
    document.getElementById("preloader_data_comment").style.display = "block"
    var d1 = new Date();
    var tps_load = new Date();
    var tps_loop = new Date();
    limit = list_villes_selected.length
    /*    data_annonces_groupees_ventes=[];
        data_annonces_groupees_locations=[];
    */
    for (reg=0; reg < limit; reg++) {
      code_reg = list_villes_selected[reg].code_reg;

      if (code_reg !== undefined && reg_Loaded_data_groupees.indexOf(code_reg) === -1) {

        try{ 
          tps_load = new Date();
          let data_ventes = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/df_groupByCommune_ventes_" + code_reg + ".csv");
          let data_locations = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/df_groupByCommune_locations_" + code_reg + ".csv");
          reg_Loaded_data_groupees.push(code_reg);
          console.log(code_reg);
          console.log("chargement en: " + (new Date() - tps_load)/1000);

          tps_loop = new Date();
          for (row in data_ventes) {
            data_annonces_groupees_ventes.push(data_ventes[row]);
          };

          for (row in data_locations) {
            data_annonces_groupees_locations.push(data_locations[row]);
          };
          console.log("boucle de transfert en: " + (new Date() - tps_loop)/1000);
        }
        catch(error) {console.log(error)}
      }
    }
  console.log("chargement data groupées en: " + (new Date() - d1)/1000)

  document.getElementById("preloader_data_comment").innerHTML = "Chargement annonces détaillées"
  chargerDataDetailleesCommunes()
  //preloader
  
  }


  //select distinct
  /*unique = [...new Set(data_annonces_groupees_ventes.map(p => p.REG))];*/
/*async function chargerDataDetailleesCommunes() {
    data_annonces_details_ventes=[];
    
    var d1 = new Date();
    var limit = list_villes_selected.filter(r=> r.commune).length

    for (i=0; i < limit; i++) {
      code_dep = list_villes_selected[i].code_dep;
      communes_selected.push(list_villes_selected[i].code_commune)

      if (code_dep !== undefined && reg_Loaded_data_details.indexOf(code_dep) === -1) {

            try{ 
              let data_ventes = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/annonces_git/df_annonces_gps_iris_ventes_" + code_dep + ".csv");
              //let data_locations = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/annonces_git/df_annonces_gps_iris_locations_" + code_dep + ".csv");
              let data_stats_communes = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/insee/communes/base_cc_comparateur/base_cc_comparateur_" + code_dep + ".csv");
              

              var poly = await d3.json("https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/ref/polygons/polygones_" + code_dep + ".json");
              Object.assign(polys, poly)
              
              console.log(code_dep)
              
              for (row in data_ventes) {
                data_annonces_details_ventes.push(data_ventes[row]);
              };

        

              for (row in data_stats_communes) {
                data_stats_insee_com.push(data_stats_communes[row]);
              };              
            }
            catch(error) {console.log(error)}
      }

      //convertir str en num
      data_annonces_details_ventes.forEach((d)=> 
      { d['nb_log_n7'] = +d['nb_log_n7']; d['surface'] = +d['surface']; d['prix_m2_vente'] = +d['prix_m2_vente']; d['nb_pieces'] = +d['nb_pieces'];
        d['surface_terrain'] = +d['surface_terrain']; d['prix_bien'] = +d['prix_bien']; d['prix_maison'] = +d['prix_maison'];
        d['prix_terrain'] = +d['prix_terrain']; d['mensualiteFinance'] = +d['mensualiteFinance']; d['balcon'] = +d['balcon'];
        d['eau'] = +d['eau']; d['bain'] = +d['bain']; d['dpeC'] = +d['dpeC'];
        d['mapCoordonneesLatitude'] = +d['mapCoordonneesLatitude']; d['mapCoordonneesLongitude'] = +d['mapCoordonneesLongitude']; d['nb_etages'] = +d['nb_etages'];
        d['places_parking'] = +d['places_parking']; d['annee_construction'] = +d['annee_construction']; d['nb_toilettes'] = +d['nb_toilettes'];
        d['nb_terraces'] = +d['nb_terraces']; d['nb_logements_copro'] = +d['nb_logements_copro']; d['charges_copro'] = +d['charges_copro'];
        d['loyer_m2_median_n6'] = +d['loyer_m2_median_n6']; d['nb_log_n6'] = +d['nb_log_n6']; d['taux_rendement_n6'] = +d['taux_rendement_n6'];
        d['loyer_m2_median_n7'] = +d['loyer_m2_median_n7']; d['taux_rendement_n7'] = +d['taux_rendement_n7']; d['flag_ligne'] = 1;
       })

    var fields_to_num = ['P17_POP', 'P12_POP',  'SUPERF',   'NAIS1217', 'DECE1217', 'P17_MEN',  'NAISD19',  'DECESD19', 'P17_LOG',  'P17_RP',   'P17_RSECOCC',  'P17_LOGVAC',   'P17_RP_PROP',  'NBMENFISC17',  'PIMP17',   'MED17',    'TP6017',   'P17_EMPLT',    'P17_EMPLT_SAL',    'P12_EMPLT',    'P17_POP1564',  'P17_CHOM1564', 'P17_ACT1564',  'ETTOT15',  'ETAZ15',   'ETBE15',   'ETFZ15',   'ETGU15',   'ETGZ15',   'ETOQ15',   'ETTEF115', 'ETTEFP1015']

    data_stats_insee_com.forEach((d)=> 
    { 
        fields_to_num.map(field=> { d[field] = +d[field] })
     })    

    data_annonces_details_ventes_filtre_communes = [...data_annonces_details_ventes]


    //prepare_data_ventes
    prepare_data_ventes()

    console.log("chargement data detaillées en: " + (new Date() - d1)/1000)
    
    document.getElementById("groupby_vl").style.display = "none"
    init_vlSpec()

    document.getElementById("preloader_data_comment").style.display = "none"
    document.getElementById("preloader_data1").style.display = "none"
  }
}*/





  document.getElementById("preloader_data1").style.display = "none"
  document.getElementById("preloader_data_comment").style.display = "none"
  var currentFocus = -1;
  var list_villes_ref = ["Mantes", "Bonnnieres", "Paris", "Malakoff", "Saintes", "Poissy", "Gap"];
  var list_villes_proposee = []
  var list_villes_selected = []
  
  //afficher champ recherche dès le début
  document.getElementById("myDropdown").style.display = "block"
  /* When the user clicks on the button,
  toggle between hiding and showing the dropdown content */
  function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
  }







  function drop_elem_selected() {

    for (v in list_villes_selected) {
      
      if (list_villes_selected[v] === this.innerHTML) {
        list_villes_selected.splice(v, 1);
      }
    }
  
  document.getElementById("alert_max_communes").innerHTML = "Communes choisies:";
  document.getElementById("alert_max_communes").style.color = "grey";

  //maintenir marge entre liste des villes choisies et le bouton de suppression
  var space = 0
/*  for (a in div_list_villes_selected.children) {  
    if (div_list_villes_selected.children[a].offsetHeight !== undefined) {
      space = space + div_list_villes_selected.children[a].offsetHeight
    }
  };*/



  this.remove()
  };










  div_list_villes_ref = document.getElementById("list_villes_ref");
  button_supprimerVilles = document.getElementById("supprimerVilles");
  button_chargerDataRegroupeesCommunes = document.getElementById("chargerDataRegroupeesCommunes");


  //lors de la sélection d'une commune par clic, appliquer le code ci-dessous
  function elem_picked() {
    if (div_list_villes_selected.childElementCount < 5) {
      var newNode = document.createElement('a');
      

      newNode.title = "Cliquer pour supprimer"
      newNode.addEventListener("click", drop_elem_selected)
      newNode.code_dep = this.code_dep
      newNode.code_commune = this.code_commune
      newNode.code_reg = this.code_reg
      var newNodeText = document.createTextNode(this.innerHTML);
      
      newNode.appendChild(newNodeText);
      //on ajoute l'élément crée à un noeud html existant (ici après list_villes_ref)
      div_list_villes_selected.appendChild(newNode);      
      /*alert(list_villes_selected);*/
      div_list_villes_selected.style.display = "block"
      

      //Afficher text encadrant les communes choisies
      document.getElementById("alert_max_communes").innerHTML = "Communes choisies:";
      document.getElementById("alert_max_communes").style.color = "grey";

      //completer le champ recherche avec l'el selectionné
      input.value = this.innerHTML
      //masquer liste des villes proposées
      div_list_villes_ref.style.display = 'none';
      //déplacer liste communes choisies sous la barre de recherche
      /*div_container_villes_selected.style.marginTop = "45px"*/

      //maintenir marge entre liste des villes choisies et le bouton de suppression
/*      var hauteur_container_commune = div_list_villes_selected.children[0].offsetHeight
      space = ((div_list_villes_selected.childElementCount-1) * hauteur_container_commune) + 50 + "px"
      button_supprimerVilles.style.marginTop = space
*/
/*      var space = 0
      for (a in div_list_villes_selected.children) {  
        if (div_list_villes_selected.children[a].offsetHeight !== undefined) {
          space = space + div_list_villes_selected.children[a].offsetHeight
        }
      };

      button_supprimerVilles.style.marginTop = space + 20 + "px"
*/

      //remplir la list des villes selectionées
      list_villes_selected = []
      a = 0
      for (a in div_list_villes_selected.children) {  
        list_villes_selected.push({"commune": div_list_villes_selected.children[a].innerHTML, "code_commune": div_list_villes_selected.children[a].code_commune,"code_dep": div_list_villes_selected.children[a].code_dep,"code_reg": div_list_villes_selected.children[a].code_reg});
      };

      //reset currentFocus
      currentFocus = -1

    }
    else {
      alert("5 villes max");
      document.getElementById("alert_max_communes").innerHTML = "Limité à 5 communes";
      document.getElementById("alert_max_communes").style.color = "red";
      //reset currentFocus
      currentFocus = -1

    }
  };








  //lors de la sélection d'une commune par clic, appliquer le code ci-dessous
  function elem_enter() {
    if (div_list_villes_selected.childElementCount < 5) {
      
      try{
        //si la sélection vient d'un enter sur le champ de recherche, prendre l'el 0 de la liste des propositions
        if (currentFocus === -1) {
          var ville = div_list_villes_ref.children[0].innerHTML;
          var code_commune = div_list_villes_ref.children[0].code_commune;
          var code_dep = div_list_villes_ref.children[0].code_dep;
          var code_reg = div_list_villes_ref.children[0].code_reg
        }
        //si la sélection vient d'un enter sur la liste des propositions, prendre l'el sur lequel est positionné le focus
        else {
          var ville = div_list_villes_ref.children[currentFocus].innerHTML;
          var code_commune = div_list_villes_ref.children[currentFocus].code_commune;
          var code_dep = div_list_villes_ref.children[currentFocus].code_dep;
          var code_reg = div_list_villes_ref.children[currentFocus].code_reg;

        };
      }
      catch(error) {
        e = 'err function elem_enter' + error
      }
      //créer et alimenter noeud
      var newNode = document.createElement('a');
      newNode.title = "Cliquer pour supprimer"
      newNode.addEventListener("click", drop_elem_selected)
      newNode.code_commune = code_commune
      newNode.code_dep = code_dep
      newNode.code_reg = code_reg
      var newNodeText = document.createTextNode(ville);
      
      newNode.appendChild(newNodeText);
      //on ajoute l'élément crée à un noeud html existant (ici après list_villes_ref)
      div_list_villes_selected.appendChild(newNode);      
      /*alert(list_villes_selected);*/
      div_list_villes_selected.style.display = "block"

      //garder highlight sur elemnt actuel
      try {div_list_villes_ref.children[currentFocus].className = "autocomplete-active"}
      catch(error) {a=console.log(error)}

      //Afficher text encadrant les communes choisies
      document.getElementById("alert_max_communes").innerHTML = "Communes choisies:";
      document.getElementById("alert_max_communes").style.color = "grey";

      //completer le champ recherche avec l'el selectionné
      input.value = ville
      //masquer liste des villes proposées
      div_list_villes_ref.style.display = 'none';
      //déplacer liste communes choisies sous la barre de recherche
      /*div_container_villes_selected.style.marginTop = "45px"*/

      //maintenir marge entre liste des villes choisies et le bouton de suppression
/*      var hauteur_container_commune = div_list_villes_selected.children[0].offsetHeight
      space = ((div_list_villes_selected.childElementCount-1) * hauteur_container_commune) + 50 + "px"
      button_supprimerVilles.style.marginTop = space*/

      //maintenir marge entre liste des villes choisies et le bouton de suppression
/*      var space = 0
      for (a in div_list_villes_selected.children) {  
        if (div_list_villes_selected.children[a].offsetHeight !== undefined) {
          space = space + div_list_villes_selected.children[a].offsetHeight
        }
      };
      button_supprimerVilles.style.marginTop = space + 20 + "px"*/

      //remplir la list des villes selectionées
      list_villes_selected = []
      a = 0
      for (a in div_list_villes_selected.children) {
        if (div_list_villes_selected.children[a].innerHTML !== undefined) {  
          list_villes_selected.push({"commune": div_list_villes_selected.children[a].innerHTML, "code_commune": div_list_villes_selected.children[a].code_commune,"code_dep": div_list_villes_selected.children[a].code_dep,"code_reg": div_list_villes_selected.children[a].code_reg});
        }
      };

      //reset currentFocus
      currentFocus = -1


    }
    else {
      alert("5 villes max");
      document.getElementById("alert_max_communes").innerHTML = "Limité à 5 communes";
      document.getElementById("alert_max_communes").style.color = "red";
      //reset currentFocus
      currentFocus = -1


    }
  };




  function selectNextElem() {
    //desactiver highlight precedent elemnt si déjà alimenté ET si on est pas sur le dernier el de la liste des propositions
    if (currentFocus > -1) {
      try {
        div_list_villes_ref.childNodes[currentFocus].className = ""
        }
      finally {a=1}
    }

    //si l'élément en surbrillance n'est pas le dernier, incrémenter
    if (currentFocus+1 < list_villes_proposee.length) {
      currentFocus++
      /*alert(currentFocus)*/
      //activer highlight elemnt actuel
      div_list_villes_ref.childNodes[currentFocus].className = "autocomplete-active"
    }
    //si l'élément en surbrillance est le dernier, garder le highlight
    else if (currentFocus+1 === list_villes_proposee.length) {
      div_list_villes_ref.childNodes[currentFocus].className = "autocomplete-active"
    }
  }

  function selectPrevElem() {
    if (currentFocus>-1) {
      //desactiver highlight precedent elemnt
      div_list_villes_ref.childNodes[currentFocus].className = ""
      currentFocus--
      /*alert(currentFocus)*/
      //activer highlight elemnt actuel
      div_list_villes_ref.childNodes[currentFocus].className = "autocomplete-active"
    }
  }

  function supprimerVilles() {
    //supprimer les villes de la liste
    while (div_list_villes_selected.hasChildNodes()) {  
      div_list_villes_selected.removeChild(div_list_villes_selected.firstChild);
    };

    sharedParams.transformations.filter.filter(f=> f.field === "INSEE_COM")[0].values = []

    //maintenir marge entre liste des villes choisies et le bouton de suppression
/*    space = 50 + "px"
    button_supprimerVilles.style.marginTop = space
*/
  }

  var input, filter;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();


  input.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
      /*alert("enter capturé");*/
      elem_enter()
    }
    else if (e.key === "ArrowUp") {
      /*alert("ArrowUp");*/
      selectPrevElem()
    }

    else if (e.key === "ArrowDown") {
      /*alert("ArrowDown");*/
      selectNextElem()
    }
    else if (e.key === "Backspace") {
      //désactiver focus
      try {
       (div_list_villes_ref.childNodes[currentFocus].className = "")
       }
      catch(error) {e = "err ligne 277"}
      finally {
        currentFocus = -1
        //déplacer liste communes choisies sous le div_list_villes_ref
/*        space = (div_list_villes_ref.childElementCount * 20) + 75 + "px"
        div_container_villes_selected.style.marginTop = space*/

      }
    }
    else if (e.shiftKey && e.key === "ArrowLeft") {
      /*alert("ArrowDown");*/
      currentFocus = -1
    }
  })


  function filterFunction() {
    //accès el contenant les items de afficher
    div_list_villes_ref = document.getElementById("list_villes_ref");
    div_list_villes_selected = document.getElementById("villes_selected");
    div_container_villes_selected  = document.getElementById("container_villes_selected");

    //supprimer les villes de la liste
    while (div_list_villes_ref.hasChildNodes()) {  
      div_list_villes_ref.removeChild(div_list_villes_ref.firstChild);
    };


    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();

    div = document.getElementById("myDropdown");
    
    //parcourir liste des villes pour chercher une  correspondance
    list_villes_proposee = [];
    for (i in (ref_communes)) {

      try {txtValue = ref_communes[i].LIBCOM.toUpperCase()}
      catch(error) {a = ("err convert: " + i)}
      
      commencePar = txtValue.startsWith(filter);
      /*if (txtValue.indexOf(filter) > -1 && filter.length > 0) {*/
      if (commencePar === true && filter.length > 1) {
        //si ville cherchée est dans la liste, l'ajouter à un tableau de stockage des matchs correspondants
        //exceptions pour villes à arrondissements
        if (ref_communes[i].LIBCOM === "Marseille (tous arrondissements)") {
          list_villes_proposee.push(
            {"commune": ref_communes[i].LIBCOM, 
            "code_commune": 
              ["13201", "13202", "13203", "13204", "13205", "13206", "13207", "13208", "13209", "13210", "13211", "13212", "13213", "13214", "13215", "13216"],
            "code_dep": "13",
            "code_reg": "93"
            });

        }
        else if (ref_communes[i].LIBCOM === "Lyon (tous arrondissements)") {
          list_villes_proposee.push(
            {"commune": ref_communes[i].LIBCOM, 
            "code_commune":
              ["69381", "69382",  "69383",  "69384",  "69385",  "69386",  "69387",  "69388",  "69389"],
            "code_dep": "69",
            "code_reg": "84"
            });
        }
        else if (ref_communes[i].LIBCOM === "Paris (tous arrondissements)") {
          list_villes_proposee.push(
            {"commune": ref_communes[i].LIBCOM, 
            "code_commune":
              ["75101", "75102",  "75103",  "75104",  "75105",  "75106",  "75107",  "75108",  "75109",  "75110",  "75111",  "75112",  "75113",  "75114",  "75115",  "75116",  "75117",  "75118",  "75119",  "75120"],
            "code_dep": "75",
            "code_reg": "11"
            });
        }
        else{
          list_villes_proposee.push(({"commune": ref_communes[i].LIBCOM, "code_commune": ref_communes[i].INSEE_COM, "code_dep": ref_communes[i].DEP,
          "code_reg": ref_communes[i].REG}));
        }
      }
    
    }


    //1.Si elements trouvés, trier le tableau
    list_villes_proposee.sort(function(a, b){
      var x = a.commune.toLowerCase();
      var y = b.commune.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });

    //2.Si elements trouvés, créer noeuds html, les alimenter avec le nom des villes trouvées et les ajouter au conteneur list_villes_ref
    if (list_villes_proposee.length > 0) {
      for (e in list_villes_proposee) {
        commune = list_villes_proposee[e].commune;
        code_commune = list_villes_proposee[e].code_commune;
        code_dep = list_villes_proposee[e].code_dep;
        code_reg = list_villes_proposee[e].code_reg;
        //créer et alimenter noeud
        var newNode = document.createElement('a');
        /*newNode.href = '#' + commune;*/
        newNode.style.cursor = "pointer";
        newNode.addEventListener("click", elem_picked)
        newNode.code_dep = code_dep;
        newNode.code_reg = code_reg;
        newNode.code_commune = code_commune;
        var newNodeText = document.createTextNode(commune + " - " + code_dep);
        
        newNode.appendChild(newNodeText);
        //on ajoute l'élément crée à un noeud html existant (ici après list_villes_ref)
        div_list_villes_ref.appendChild(newNode);
      }

      //afficher div_list_villes_ref
      //limite la liste des propositions à 4
      while (div_list_villes_ref.childElementCount > 6) {
        div_list_villes_ref.removeChild(div_list_villes_ref.lastChild);
      }

      div_list_villes_ref.style.display = 'block';
/*      //déplacer liste communes choisies sous le div_list_villes_ref
      space = (div_list_villes_ref.childElementCount * 20) + 75 + "px"
      div_container_villes_selected.style.marginTop = space*/
    }

    else {
      div_list_villes_ref.style.display = 'none';
    }

  } 