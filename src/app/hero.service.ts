import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { Hero } from './hero';
import { MessageService } from './message.service';

const heroesQuery = gql`
  query heroesQuery {
    heroes {
      id
      name
    }
  }
`;

const heroQuery = gql`
  query heroQuery($id: Int!) {
    hero(id: $id) {
      id
      name
    }
  }
`;

const searchQuery = gql`
  query searchQuery($q: String) {
    search(q: $q) {
      id
      name
    }
  }
`;

const addHero = gql`
  mutation addHero($input: HeroInput) {
    addHero(input: $input) {
      id
      name
    }
  }
`;

const deleteHero = gql`
  mutation deleteHero($id: Int!) {
    deleteHero(id: $id)
  }
`;

const updateHero = gql`
  mutation updateHero($id: Int!, $input: HeroInput) {
    updateHero(id: $id, input: $input) {
      id
      name
    }
  }
`;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HeroService {
  private heroesUrl = 'api/heroes'; // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private apollo: Apollo
  ) {}

  /** GET heroes from the server */
  getHeroes(): Observable<Hero[]> {
    return this.apollo
      .watchQuery<any>({
        query: heroesQuery
      })
      .valueChanges.pipe(
        map(result => result.data.heroes),
        tap(heroes => this.log(`fetched heroes`)),
        catchError(this.handleError('getHeroes', []))
      );
  }

  /** GET hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    return this.apollo
      .watchQuery<any>({
        query: heroQuery
      })
      .valueChanges.pipe(
        map(result => result.data.heroes[0]),
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    return this.apollo
      .watchQuery<any>({
        query: heroQuery,
        variables: {
          id: id
        }
      })
      .valueChanges.pipe(
        map(result => result.data.hero),
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.apollo
      .watchQuery<any>({
        query: searchQuery,
        variables: {
          q: term
        }
      })
      .valueChanges.pipe(
        map(result => result.data.search),
        tap(_ => this.log(`found heroes matching "${term}"`)),
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    return this.apollo
      .mutate({
        mutation: addHero,
        variables: {
          input: {
            name: hero.name
          }
        }
      })
      .pipe(
        map(result => result.data.addHero),
        tap((hero: Hero) => this.log(`added hero w/ id=${hero.id}`)),
        catchError(this.handleError<Hero>('addHero'))
      );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    //const url = `${this.heroesUrl}/${id}`;

    return this.apollo
      .mutate({
        mutation: deleteHero,
        variables: {
          id: id
        }
      })
      .pipe(
        map(result => result.data.deleteHero),
        tap(_ => this.log(`deleted hero id=${id}`)),
        catchError(this.handleError<Hero>('deleteHero'))
      );
  }

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    return this.apollo
      .mutate({
        mutation: updateHero,
        variables: {
          id: hero.id,
          input: {
            name: hero.name
          }
        }
      })
      .pipe(
        map(result => result.data.updateHero),
        tap(_ => this.log(`updated hero id=${hero.id}`)),
        catchError(this.handleError<Hero>('addHero'))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add('HeroService: ' + message);
  }
}
