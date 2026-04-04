import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { InMemoryCache, split } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { routes } from './app.routes';

export function apolloOptionsFactory(httpLink: HttpLink) {
  console.log('🚀 Apollo factory inițializat');
  const http = httpLink.create({
    uri: 'http://localhost:8080/graphql'
  });
   console.log('🔗 Creez WebSocket client...');
  const ws = new GraphQLWsLink(
    createClient({
      url: 'ws://localhost:8080/graphql',
      retryAttempts: 10,
      shouldRetry: () => true,
      connectionAckWaitTimeout: 30000, 
      keepAlive: 10000,
      on: {
          connected: () => console.log('✅ WebSocket conectat'),
  error: (err: unknown) => console.error('❌ WebSocket eroare:', err),
  closed: (event: unknown) => console.log('🔌 WebSocket închis:', JSON.stringify(event)),
  connecting: () => console.log('🔄 WebSocket reconectare...'),
  message: (msg: unknown) => console.log('📨 Mesaj primit:', msg),
      }
    })
  );
console.log('✅ WebSocket client creat');
  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    ws,
    http
  );

  return {
    link,
    cache: new InMemoryCache(),
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    Apollo,
    {
      provide: APOLLO_OPTIONS,
      useFactory: apolloOptionsFactory,
      deps: [HttpLink],
    },
  ]
};