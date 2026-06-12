import {
  ApplicationConfig,
  APP_INITIALIZER
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { Apollo } from 'apollo-angular';
import { InMemoryCache, split } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AuthService } from './core/services/auth.service';

export function apolloOptionsFactory(
    httpLink: HttpLink) {

  console.log('🚀 Apollo factory inițializat');

  const http = httpLink.create({
    uri: 'http://localhost:8080/graphql',
    withCredentials: true
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
        connected: () =>
          console.log('✅ WebSocket conectat'),
        error: (err: unknown) =>
          console.error('❌ WebSocket eroare:', err),
        closed: (event: unknown) =>
          console.log('🔌 WebSocket închis:',
            JSON.stringify(event)),
        connecting: () =>
          console.log('🔄 WebSocket reconectare...'),
        message: (msg: unknown) =>
          console.log('📨 Mesaj primit:', msg),
      }
    })
  );

  console.log('✅ WebSocket client creat');

  const link = split(
    ({ query }) => {
      const definition =
        getMainDefinition(query);
      return (
        definition.kind ===
          'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    ws,
    http
  );

  return {
    link,
    cache: new InMemoryCache()
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),

    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),

    {
      provide:    APP_INITIALIZER,
      useFactory: (auth: AuthService) =>
        () => auth.checkSession(),
      deps:       [AuthService],
      multi:      true
    },

    Apollo,
    {
      provide:    APOLLO_OPTIONS,
      useFactory: apolloOptionsFactory,
      deps:       [HttpLink],
    },
  ]
};