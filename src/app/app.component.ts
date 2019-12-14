import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from './core/services/app.service';
import * as moment from 'moment'; // add this 1 of 4

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'rickandmorty';

  characterList = [];  
  screenListView = []; 


  // filterList; 
  speciesFilterList = []; 
  genderFilterList = []; 
  originFilterList = []; 
  
  // filters
  speciesFilter = {}; 
  originFilter = {};
  genderFilter = {}; 

  // sort order 
  sortOrder;


  // show hide flags
  showMoreSpecies = false;
  showMoreGenders = false;
  showMoreOrigins = false;

  //search Text 
  searchText

  // selected Filter Screen 
  selectedFilterScreen = [];
  
  
  constructor ( private http:HttpClient, private appSvc: AppService) {
    //this.loadData (); 
  }

  ngOnInit() {
    
    this.getCharacterData (); 
    
    this.appSvc.characterDataEvent.subscribe ((resp) => {
       this.getCharacterData (); 
    })


  }

  getCharacterData () {
     
    let data = this.appSvc.getCharactersData();     
    this.characterList = data['charData'];

    this.speciesFilterList  = data['speciesList']; 
    this.genderFilterList = data['genderList']; 
    this.originFilterList = data['originList']; 

    this.refreshListView(); 

  }
  deleteFilterFrom ( name , value ) {
    if( name == "species") {
      this.updateSpeciesFilter ( value );
    } else if ( name == "gender") { 
      this.updateGenderFilter ( value );
    } else if ( name == "origin") {
      this.updateOriginFilter ( value );
    }

  }

  updateSpeciesFilter ( value ) {
    this.speciesFilter[value] = !this.speciesFilter[value]; 
    this.refreshListView(); 
  }

  updateOriginFilter ( value ) {
    this.originFilter[ value ] = !this.originFilter[ value ]; 
    this.refreshListView(); 
  }

  updateGenderFilter ( value ) {
    this.genderFilter[ value ] = !this.genderFilter[ value ]; 
    this.refreshListView(); 
  }


  createUrl () {

    let url = "https://rickandmortyapi.com/api/character/?page=2";
    return url; 
    
  }

  getKeys ( filters ) {

    let arr = [];   
    for ( let key in filters ) {
      if( filters[key] ) {
        arr.push( key );
      }      
    }

    return arr; 
  }



  loadData () {

    for (  let i = 0 ; i < 2; i ++) {
      let url = "https://rickandmortyapi.com/api/character/?page=" + i;
      this.http.get( url ).subscribe ((response) => {
        this.appendToList (  response['results'] ); 
      }); 
    }  

  }

  addToFilterScreen ( list , name ) {
  
    for (  let i = 0 ; i < list.length; i ++) {
      this.selectedFilterScreen.push({name: name , 
                                     value: list[i] });
    }


    
  }

  applyFilters ( item ) {

    this.selectedFilterScreen = []; 
  
    let matchCount = 0, filterCount = 0 ;

    let speciesArr  = this.getKeys ( this.speciesFilter ); 
    let genderArr  = this.getKeys ( this.genderFilter ); 
    let originArr  = this.getKeys ( this.originFilter ); 

    this.addToFilterScreen (  speciesArr , "species"); 
    this.addToFilterScreen (  originArr , "origin"); 
    this.addToFilterScreen (  genderArr , "gender"); 
    
    
    // for species; 
    if( speciesArr.length > 0 ) {
      filterCount ++; 
      if( this.applyFilterByFieldName ( speciesArr, item, 'species')) {
        matchCount ++; 
      }
    }

    // for gender;
    if ( genderArr.length > 0 ) {
      filterCount ++; 
      if( this.applyFilterByFieldName ( genderArr, item, 'gender')) {
        matchCount ++; 
      }
    }

    // for origin
    if (  originArr.length > 0 ) {
      filterCount ++; 
      if( this.applyFilterByFieldName ( originArr, item, 'origin', 'name')) {
        matchCount ++; 
      }
    }

    console.log ( this.selectedFilterScreen );

    if( filterCount == matchCount ) {
      return true; 
    }

    return false; 

  }

  applyFilterByFieldName ( keys , item, fieldName, subField = "") {
     
    if( keys.length == 0 ) return true; 

    // check for species 
    for ( let i = 0; i < keys.length; i ++) {

      let val = item[fieldName]; 
      if( subField != "") {
        val = val[subField]; 
      }  

      if( val.toLowerCase() == keys[i].toLowerCase() ) {
        return true; 
      }
    }

    return false; 

  }

  refreshListView () {
     // check keyword. 
     // check filters.      
     if( !this.characterList ) return; 

     this.screenListView = []; 
     for (  let i = 0 ; i < this.characterList.length; i ++ ) {

      let item = this.characterList[i]; 
      
      if ( this.applyFilters( item ) ) {
        
        if( this.searchText ) {
          
          if( item.name.toLowerCase().indexOf( this.searchText ) >= 0) {
            this.screenListView.push ( item ); 
          }

        } else {
          this.screenListView.push ( item ); 
        }
                
       
        if( this.screenListView.length  > 25 ) {
          break; 
        }
       
      }       
       
     }

     this.applySorting (); 

  }

  applySorting () {
    if( !this.sortOrder ) {
      this.sortOrder = "asc";
    }

    if( this.sortOrder == "asc") {
      this.screenListView.sort ( ( a, b ) => {
        return a.index - b.index;
      })
    } else if ( this.sortOrder == "desc") {
      this.screenListView.sort ( ( a, b ) => {
        return b.index - a.index;
      })
    }


  }


  appendToList ( data ) {
    for (  let i = 0 ; i < data.length; i ++) {
       
       this.characterList.push( data[i] ); 
    }
    this.refreshListView (); 
  }

  parseCreated ( dateStr ) {
    return moment (  dateStr ).fromNow (); 
  }


  // Sort Order changed 
  sortOrderChanged () {
    this.applySorting(); 
  }


  subList ( list, start, end = -1 ) {
    let arr = []; 
    let len = list.length;
    if( end > 0 ) {
      len = end; 
    } 

    for (  let i = start ; i < len; i ++ ) {
      arr.push (  list[i]); 
    }
    
    return arr; 

  }

  toggleSpeciesFilter ( value ) {
    this.showMoreSpecies = value;
  }

  toggleGendersFilter ( value ) {
    this.showMoreGenders = value;
  }

  toggleOriginsFilter ( value ) {
    this.showMoreOrigins = value;
  }


  searchByName () {
     this.refreshListView (); 
  }
  

}
