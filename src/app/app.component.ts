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

  applyFilters ( item ) {

    let matchCount = 0, filterCount = 0 ;
    let speciesArr  = this.getKeys ( this.speciesFilter ); 
    let genderArr  = this.getKeys ( this.genderFilter ); 
    let originArr  = this.getKeys ( this.originFilter ); 

    
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
        this.screenListView.push ( item ); 

        if( this.screenListView.length  > 25 ) {
          break; 
        }
       }       

       
       
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

}
