import { Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventEmitter } from 'events';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  
  characterDataEvent:Subject<any>;

  characterList = []; 
  constructor(private http: HttpClient) {

    this.characterDataEvent = new Subject<any>();

  }

  extractListByFieldName ( charList , fieldName, subFieldName = "" ) {
    let arr = []; 
    for (  let i = 0 ; i < charList.length; i ++) {
      let val = charList[i][ fieldName ]; 

      if( subFieldName != "") {
        val = val[subFieldName]; 
      }

      if( arr.indexOf ( val ) < 0) {
        arr.push( val );  
      }
      
    }
    return arr; 
  }


  getCharactersData () {

    let charactersData = localStorage.getItem('characters'); 

    if( charactersData ) {
      let charData =  JSON.parse( charactersData ); 
      
      let speciesList = this.extractListByFieldName ( charData, 'species' ); 
      let genderList = this.extractListByFieldName ( charData , 'gender'); 
      let originList = this.extractListByFieldName ( charData , 'origin', 'name'); 
      

      return  { charData, speciesList, genderList, originList }; 

    } else {
     
      let promiseArr = []; 
      for (  let i = 0 ; i < 10; i ++) {
        let url = "https://rickandmortyapi.com/api/character/?page=" + i;

        promiseArr.push (  
           this.http.get( url ).toPromise()
        );

      }  

      Promise.all( promiseArr ).then( ( resp) => {
        for ( let i = 0 ; i < resp.length ; i ++) {
            this.appendToList (  resp[i].results ); 
        }
        localStorage.setItem('characters', JSON.stringify ( this.characterList )); 
        
        this.characterDataEvent.next( this.characterList ); 

      })
    }

  }

  appendToList ( data ) {
    for (  let i = 0 ; i < data.length; i ++) {
       this.characterList.push( data[i] ); 
    }    
  }


}
