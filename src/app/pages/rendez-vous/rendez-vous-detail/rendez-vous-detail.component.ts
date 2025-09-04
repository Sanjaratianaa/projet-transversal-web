import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-rendez-vous-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTabsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        DatePipe,
    ],
    templateUrl: './rendez-vous-detail.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    animations: [
        trigger('tabAnimation', [
            state('active', style({ opacity: 1 })),
            state('inactive', style({ opacity: 0 })),
            transition('inactive => active', animate('200ms ease-in')),
            transition('active => inactive', animate('200ms ease-out'))
        ])
    ]
})
export class RendezVousDetailComponent implements OnInit {
    rendezVousId: string | null = null;

    rendezVous: any = {};

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { 
        this.rendezVous = this.router.getCurrentNavigation()?.extras.state?.['rendezVous']
    }

    selectedTabIndex: number = 0;

    getServiceStatusStyle(status: string): any {
        switch (status) {
            case 'en attente':
                return { 'background-color': '#f7b801', 'color': 'white' };
            case 'validé':
                return { 'background-color': '#8cb369', 'color': 'white' };
            case 'rejeté':
                return { 'background-color': '#d90429', 'color': 'white' };
            case 'annulé':
                return { 'background-color': '#6f1d1b', 'color': 'white' };
            case 'terminé':
                return { 'background-color': '#8ac926', 'color': 'white' };
            default:
                return { 'background-color': '#cccccc', 'color': 'black' };
        }
    }

    getTabAnimationState(index: number): string {
        return (this.selectedTabIndex === index) ? 'active' : 'inactive';
    }

    ngOnInit(): void {
        this.rendezVousId = this.route.snapshot.queryParamMap.get('id');

        if (this.rendezVousId) {
            console.log('RendezVous ID:', this.rendezVousId);
        } else {
            console.error('RendezVous ID not found in route.');
        }
    }

    tabChanged(tabChangeEvent: any): void {
        this.selectedTabIndex = tabChangeEvent.index;
    }

    onCancelClick(): void {
        this.router.navigate(['/rendez-vous']);
    }
}