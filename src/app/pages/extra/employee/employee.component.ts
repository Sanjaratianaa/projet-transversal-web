import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MaterialModule } from 'src/app/material.module';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';  // Assurez-vous que FormsModule est bien importé ici
import { GenericModalComponent } from '../../../components/modal-generique/add-modal/modal.component';
import { DeleteConfirmationModalComponent } from '../../../components/modal-generique/confirm-modal/delete-confirmation-modal.component';

export interface Employee {
  id: number;
  name: string;
  department: string;
}

@Component({
  selector: 'app-employee',
  // standalone: true,
  templateUrl: './employee.component.html',
  imports: [MatListModule, MatCardModule, MatIconModule, MaterialModule, FormsModule],

})
export class EmployeeComponent {
  displayedColumns: string[] = ['id', 'name', 'department', 'actions'];
  employees: any[] = [
    { id: 1, name: 'Alice Dupont', department: 'IT' },
    { id: 2, name: 'Jean Martin', department: 'HR' },
    { id: 3, name: 'Sophie Bernard', department: 'Finance' },
    { id: 4, name: 'Paul Durand', department: 'Marketing' },
    { id: 5, name: 'Nathalie Lefevre', department: 'Sales' },
    { id: 6, name: 'Louis Boulanger', department: 'Support' },
    { id: 7, name: 'Julie Leroux', department: 'Operations' },
    { id: 8, name: 'Marc Dupuis', department: 'Design' },
    { id: 9, name: 'Claire Girard', department: 'IT' },
    { id: 10, name: 'Lucas Petit', department: 'HR' },
    // Ajoutez d'autres employés si nécessaire
  ];

  paginatedEmployees: Employee[] = [];

  // Nouveau employé à ajouter
  newEmployee = { name: '', department: '' };

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog) { }

  openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter un Employé',
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true, defaultValue: '' },
        {
          name: 'department', label: 'Département', type: 'select', required: true, defaultValue: '',
          options: [
            { value: 'RH', label: 'Ressources Humaines' },
            { value: 'IT', label: 'Informatique' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Sales', label: 'Sales' },
            { value: 'Support', label: 'Support' },
            { value: 'Operations', label: 'Operations' },
            { value: 'Design', label: 'Design' }
          ]
        }
      ],
      submitText: 'Ajouter',
      errorMessage: errorMessage  // Ajout du message d'erreur pour la modale
    };

    console.log(data);

    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '400px',
      data: data,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        try {
          console.log('Données du formulaire:', result);

          // Vérifiez si l'employé existe déjà (exemple de validation)
          const employeeExists = this.employees.some(emp => emp.name === result.name);

          if (employeeExists) {
            throw new Error('Employé existe déjà.');
          }

          // Si l'employé n'existe pas, vous pouvez procéder à l'ajout
          this.newEmployee.name = result.name;
          this.newEmployee.department = result.department;
          this.addEmployee();

        } catch (error: any) { // Spécifier que error est de type 'unknown'
          if (error instanceof Error) { // Vérification du type réel de l'erreur
            console.error('Erreur lors de l’ajout:', error.message);
            // Ouvrir la modale avec un message d'erreur spécifique
            this.openModal('Erreur lors de l’ajout de l’employé : ' + error.message);
          } else {
            console.error('Erreur inconnue lors de l’ajout');
            this.openModal('Erreur inconnue lors de l’ajout de l’employé.');
          }
        }
      }});
  }


  add() {
    this.openModal();
  }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
  }

  // Fonction pour ajouter un employé
  addEmployee() {
    if (this.newEmployee.name && this.newEmployee.department) {
      const newId = this.employees.length + 1;
      const employee = { ...this.newEmployee, id: newId };
      this.employees.push(employee);
      this.newEmployee = { name: '', department: '' }; // Réinitialiser le formulaire

      // Calculer le nombre total d'éléments dans la page actuelle
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;

      // Vérifier si la page actuelle a encore de la place
      if (this.employees.length > startIndex && this.employees.length <= endIndex) {
        // La page actuelle a encore de la place, on reste dessus
      } else {
        // Aller à la dernière page si la page actuelle est pleine
        this.currentPage = Math.floor((this.employees.length - 1) / this.pageSize);
        console.log(`Aller à la nouvelle dernière page : ${this.currentPage}`);
      }

      this.updatePagination(); // Mettre à jour la pagination
    }
  }

  // Méthode pour ouvrir le modal en mode édition
  openEditModal(employee: Employee) {
    const data = {
      title: 'Modifier un Employé',
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true, defaultValue: employee.name },
        {
          name: 'department', label: 'Département', type: 'select', required: true, defaultValue: employee.department,
          options: [
            { value: 'RH', label: 'Ressources Humaines' },
            { value: 'IT', label: 'Informatique' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Sales', label: 'Sales' },
            { value: 'Support', label: 'Support' },
            { value: 'Operations', label: 'Operations' },
            { value: 'Design', label: 'Design' }
          ]
        }
      ],
      submitText: 'Modifier',
      errorMessage: ''
    };

    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '400px',
      data: data,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Modification enregistrée:', result);

        // Mettre à jour les infos de l’employé sélectionné
        const index = this.employees.findIndex(emp => emp.id === employee.id);
        if (index !== -1) {
          this.employees[index] = { ...this.employees[index], ...result };
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    });
  }

  // Méthode appelée lorsqu'on clique sur "Modifier"
  editEmployee(employee: Employee) {
    this.openEditModal(employee);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(employeeId: number): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteEmployee(employeeId); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  deleteEmployee(employeeId: number) {
    console.log('Deleting employee with ID:', employeeId);
    this.employees = this.employees.filter(emp => emp.id !== employeeId);

    // Calculer le nombre total de pages après suppression
    const totalPages = Math.ceil(this.employees.length / this.pageSize);

    // Si on est sur une page vide après suppression, revenir à la dernière page disponible
    if (this.currentPage >= totalPages) {
      this.currentPage = Math.max(0, totalPages - 1); // Ne pas descendre en dessous de 0
    }

    this.updatePagination(); // Mettre à jour l'affichage
  }

  // Fonction pour gérer la pagination
  onPaginateChange(event: PageEvent) {
    const { pageIndex, pageSize } = event;
    this.currentPage = pageIndex;
    this.pageSize = pageSize;

    this.updatePagination();

    // Vous pouvez ajouter ici une logique de récupération des données paginées depuis un serveur si nécessaire
    console.log('Pagination changed: ', event);
  }

}

@Component({
  selector: 'app-modal',
  template: `
  `,
})
export class ModalComponent {
  constructor(public dialog: MatDialog) { }

  close() {
    this.dialog.closeAll(); // Ferme la modale
  }
}