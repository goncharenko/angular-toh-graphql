import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
// Apollo
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

// GraphiQL: https://launchpad.graphql.com/1jzxrj179
const uri = 'https://4rv3v19w49.lp.gql.zone/graphql';

@NgModule({
  exports: [HttpClientModule, ApolloModule, HttpLinkModule]
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {
    // create Apollo
    apollo.create({
      link: httpLink.create({ uri }),
      cache: new InMemoryCache()
    });
  }
}
