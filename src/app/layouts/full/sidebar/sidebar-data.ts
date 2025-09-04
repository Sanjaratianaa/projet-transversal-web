import { NavItem } from './nav-item/nav-item';

function filterNavItems(navItems: NavItem[], userRole: string): NavItem[] {
  return navItems.filter(item => {
    if (item.navCap || item.divider) {
      return true;
    }

    if (userRole === 'manager') {
      return (
        item.navCap === 'Home' ||
        item.displayName === 'Dashboard' ||
        item.navCap === 'Service' ||
        item.displayName === 'Service' ||
        item.displayName === 'Sous Service' ||
        item.displayName === 'Prix Sous Service' ||
        item.displayName === 'Gestion Promotion' ||
        item.navCap === 'Voiture' ||
        item.displayName === 'Voiture' ||
        item.displayName === 'Categorie' ||
        item.displayName === 'Marque' ||
        item.displayName === 'Modele' ||
        item.displayName === 'Type de Transmission' ||
        item.navCap === 'MECANICIEN' ||
        item.displayName === 'Mecanicien' ||
        item.displayName === 'Specialité' ||
        item.navCap === 'RENDEZ-VOUS' ||
        item.displayName === 'Historique Rendez-vous' ||
        item.displayName === 'Planning Rendez-vous' ||
        item.displayName === 'Demande en attente' ||
        item.navCap === 'Pièce détachée' ||
        item.displayName === 'Piece' ||
        item.displayName === 'Gestion Stock' ||
        item.displayName === 'Stock Piece' ||
        item.displayName === 'Gestion Prix Piece' ||
        item.navCap === 'CONGES' ||
        item.displayName === 'Planning Congés' ||
        item.displayName === 'Historique Congés' ||
        item.displayName === 'Demande en attente congés'
      );


    } else if (userRole === 'client') {
      return (
        item.navCap === 'Home' ||
        item.displayName === 'Dashboard' ||
        item.navCap === 'Voiture' ||
        item.displayName === 'Voiture' ||
        item.displayName === 'Categorie' ||
        item.displayName === 'Marque' ||
        item.displayName === 'Modele' ||
        item.displayName === 'Type de Transmission' ||
        item.navCap === 'RENDEZ-VOUS' ||
        item.displayName === 'Interventions' ||
        item.displayName === 'Prendre Rendez-vous' ||
        item.displayName === 'Historique Rendez-vous' ||
        item.displayName === 'Demande en attente' ||
        item.navCap === 'Service' ||
        item.displayName === 'Service' ||
        item.displayName === 'Sous Service' ||
        item.navCap === 'Pièce détachée' ||
        item.displayName === 'Piece' ||
        item.displayName === 'Stock Piece' 
      );
    } else if (userRole === 'mecanicien' || userRole === 'mécanicien') {
      return (
        item.navCap === 'Home' ||
        item.displayName === 'Dashboard' ||
        item.displayName === 'Service' ||
        item.displayName === 'Sous Service' ||
        item.navCap === 'Voiture' ||
        item.displayName === 'Voiture' ||
        item.displayName === 'Categorie' ||
        item.displayName === 'Marque' ||
        item.displayName === 'Modele' ||
        item.displayName === 'Type de Transmission' ||
        item.navCap === 'RENDEZ-VOUS' ||
        item.displayName === 'Interventions' ||
        item.displayName === 'Planning Rendez-vous' ||
        item.navCap === 'Service' ||
        item.displayName === 'Service' ||
        item.displayName === 'Sous Service' ||
        item.navCap === 'MECANICIEN' ||
        item.displayName === 'Mecanicien' ||
        item.displayName === 'Specialité' ||
        item.navCap === 'Pièce détachée' ||
        item.displayName === 'Piece' ||
        item.displayName === 'Stock Piece' ||
        item.navCap === 'CONGES' ||
        item.displayName === 'Prendre Congés' ||
        item.displayName === 'Historique Congés' ||
        item.displayName === 'Demande en attente congés' 
      );
    }

    return false; // Hide by default if no role matches
  });
}

export function getNavItemsForRole(userRole: string): NavItem[] {
  const allNavItems: NavItem[] = [
    {
      navCap: 'Home',
    },
    {
      displayName: 'Dashboard',
      iconName: 'solar:widget-add-line-duotone',
      route: '/dashboard',
    },

    {
      navCap: 'Voiture',
      divider: true
    },
    {
      displayName: 'Voiture',
      iconName: 'solar:bill-list-line-duotone',
      route: '/voiture',
    },
    {
      displayName: 'Categorie',
      iconName: 'solar:bill-list-line-duotone',
      route: '/voiture/categorie',
    },
    {
      displayName: 'Marque',
      iconName: 'solar:bill-list-line-duotone',
      route: '/voiture/marque',
    },
    {
      displayName: 'Modele',
      iconName: 'solar:bill-list-line-duotone',
      route: '/voiture/modele',
    },
    {
      displayName: 'Type de Transmission',
      iconName: 'solar:bill-list-line-duotone',
      route: '/voiture/type-transmission',
    },

    {
      navCap: 'Pièce détachée',
      divider: true
    },
    {
      displayName: 'Piece',
      iconName: 'solar:widget-2-line-duotone',
      route: '/voiture/piece',
    },
    {
      displayName: 'Gestion Stock',
      iconName: 'solar:bill-list-line-duotone',
      route: '/voiture/piece/gestion-stock',
    },
    {
      displayName: 'Stock Piece',
      iconName: 'solar:widget-2-line-duotone',
      route: '/voiture/piece/stock',
    },
    {
      displayName: 'Gestion Prix Piece',
      iconName: 'solar:bill-list-line-duotone',
      route: '/voiture/piece/prix',
    }, 

    {
      navCap: 'Service',
      divider: true
    },
    {
      displayName: 'Service',
      iconName: 'fluent-mdl2:service-off',
      route: '/service',
    },
    {
      displayName: 'Sous Service',
      iconName: 'fluent-mdl2:service-off',
      route: '/service/sous-service',
    },
    {
      displayName: 'Prix Sous Service',
      iconName: 'solar:bill-list-line-duotone',
      route: '/service/prix-sous-service', 
    },
    {
      displayName: 'Gestion Promotion',
      iconName: 'solar:bill-list-line-duotone',
      route: '/service/promotion/gestion-promotion', 
    },

    {
      divider: true,
      navCap: 'MECANICIEN',
    },
    {
      displayName: 'Mecanicien',
      iconName: 'solar:user-id-line-duotone',
      route: '/personne',
      chip: true,
    },
    {
      displayName: 'Specialité',
      iconName: 'solar:bill-list-line-duotone',
      route: '/specialite',
      chip: true,
    },

    {
      divider: true,
      navCap: 'RENDEZ-VOUS',
    },
    {
      displayName: 'Interventions',
      iconName: 'solar:widget-4-line-duotone',
      route: '/rendez-vous/interventions',
      chip: true,
    },
    {
      displayName: 'Prendre Rendez-vous',
      iconName: 'solar:bookmark-square-minimalistic-line-duotone',
      route: '/rendez-vous',
      chip: true,
    },
    {
      displayName: 'Planning Rendez-vous',
      iconName: 'solar:bookmark-square-minimalistic-line-duotone',
      route: '/rendez-vous',
      chip: true,
    },
    {
      displayName: 'Demande en attente',
      iconName: 'solar:document-text-line-duotone',
      route: '/rendez-vous/en-attente',
      chip: true,
    },
    {
      displayName: 'Historique Rendez-vous',
      iconName: 'solar:document-text-line-duotone',
      route: '/rendez-vous/historique-demande',
      chip: true,
    },

    {
      divider: true,
      navCap: 'CONGES',
    },
    {
      displayName: 'Prendre Congés',
      iconName: 'solar:bookmark-square-minimalistic-line-duotone',
      route: '/conges',
      chip: true,
    },
    {
      displayName: 'Planning Congés',
      iconName: 'solar:bookmark-square-minimalistic-line-duotone',
      route: '/conges',
      chip: true,
    },
    {
      displayName: 'Demande en attente congés',
      iconName: 'solar:document-text-line-duotone',
      route: '/conges/en-attente',
      chip: true,
    },
    {
      displayName: 'Historique Congés',
      iconName: 'solar:document-text-line-duotone',
      route: '/conges/historique-demande',
      chip: true,
    },
  ];

  return filterNavItems(allNavItems, userRole);
}