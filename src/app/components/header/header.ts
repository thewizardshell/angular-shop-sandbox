import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMenuOpen = signal(false);

  navigation = [
    { title: 'Customers', path: 'javascript:void(0)' },
    { title: 'Careers', path: 'javascript:void(0)' },
    { title: 'Guides', path: 'javascript:void(0)' },
    { title: 'Partners', path: 'javascript:void(0)' },
  ];

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}
