import { Component, Input } from '@angular/core';

type WhatsappSupportVariant = 'floating' | 'nav' | 'sidebar';

@Component({
  selector: 'app-whatsapp-support',
  standalone: true,
  templateUrl: './whatsapp-support.component.html',
  styleUrl: './whatsapp-support.component.css',
})
export class WhatsappSupportComponent {
  @Input() variant: WhatsappSupportVariant = 'floating';
  @Input() label = 'Suporte';

  readonly whatsappUrl = 'https://wa.me/5543999721068?text=Ola%2C%20preciso%20de%20suporte%20no%20Agende.';
  readonly ariaLabel = 'Abrir suporte no WhatsApp';
}
