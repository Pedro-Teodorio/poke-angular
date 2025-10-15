import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'pokedex', 
        pathMatch: 'full'
    },
    {
        path: 'pokedex',
        loadComponent: () => import('./pokedex/pokemon-list/pokemon-list.component').then(c => c.PokemonListComponent)
    },
    {
        path: 'pokedex/:name',
        loadComponent: () => import('./pokedex/pokemon-detail/pokemon-detail.component').then(c => c.PokemonDetailComponent)
    }
];