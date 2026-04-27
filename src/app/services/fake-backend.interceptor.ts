import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { AppUser } from '../user/models/user';
import { Professional } from '../scheduling/models/professional';
import { ServiceOffered } from '../scheduling/models/service_offered';
import { Company } from '../company/models/company';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  
  private fakeUsers: AppUser[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'a@b.com',
      phoneNumber: '11999999999',
      birthDate: new Date('1990-01-01'),
      password: '123',
      confirmPassword: '123',
      imageUrl: 'assets/user-icon.svg'
    }
  ];

  private fakeServices: ServiceOffered[] = [
    {
      id: '1',
      name: 'Haircut',
      description: 'Professional haircut service',
      price: 50
    },
    {
      id: '2',
      name: 'Beard Trim',
      description: 'Beard trimming and shaping',
      price: 30
    },
    {
      id: '3',
      name: 'Hair Coloring',
      description: 'Professional hair coloring',
      price: 80
    }
  ];

  private fakeProfessionals: Professional[] = [
    {
      id: '1',
      userName: 'John Professional',
      description: 'Expert barber with 10 years experience',
      userImageUrl: 'assets/user-icon.svg'
    },
    {
      id: '2',
      userName: 'Maria Professional',
      description: 'Specialist in hair coloring',
      userImageUrl: 'assets/user-icon.svg'
    }
  ];

  private fakeCompanies: Company[] = [
    {
      id: '1',
      name: 'Barbershop Elite',
      description: 'Premium barbershop services',
      email: 'contact@barbershop.com',
      phone: '11999999999',
      address: 'Rua Principal, 123',
      city: 'São Paulo',
      state: 'SP',
      zip: '01234-567',
      status: 1,
      scheduleStatus: 1,
      schedulingUrl: 'barbershop-elite',
      servicesOffered: this.fakeServices,
      employeers: this.fakeProfessionals,
      openingHours: []
    }
  ];

  private fakeSchedules: any[] = [
    {
      id: '1',
      title: 'Haircut - John Doe',
      start: new Date(new Date().setHours(10, 0, 0)),
      end: new Date(new Date().setHours(11, 0, 0)),
      backgroundColor: '#FFC107',
      borderColor: '#FFC107',
      companyId: '1',
      professionalId: '1',
      serviceId: '1',
      customerId: '1'
    },
    {
      id: '2',
      title: 'Beard Trim - Jane Smith',
      start: new Date(new Date().setHours(14, 0, 0)),
      end: new Date(new Date().setHours(14, 30, 0)),
      backgroundColor: '#17A2B8',
      borderColor: '#17A2B8',
      companyId: '1',
      professionalId: '2',
      serviceId: '2',
      customerId: '2'
    },
    {
      id: '3',
      title: 'Hair Coloring - Bob Wilson',
      start: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(9, 0, 0),
      end: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(11, 0, 0),
      backgroundColor: '#28A745',
      borderColor: '#28A745',
      companyId: '1',
      professionalId: '1',
      serviceId: '3',
      customerId: '3'
    }
  ];

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, body } = request;

    return of(null).pipe(
      mergeMap(() => {
        // Login endpoint
        if (url.includes('/login') && method === 'POST') {
          const { emailOrPhone, password } = body;
          if (emailOrPhone === 'john@example.com' && password === 'password123') {
            return of(new HttpResponse({
              status: 200,
              body: {
                data: {
                  id: '1',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john@example.com',
                  token: 'fake-jwt-token-' + Date.now()
                }
              }
            }));
          } else {
            return throwError(() => new HttpErrorResponse({
              status: 401,
              statusText: 'Unauthorized',
              error: { data: null, message: 'Invalid credentials' }
            }));
          }
        }

        // Register endpoint
        if (url.includes('/register') && method === 'POST') {
          const newUser = { ...body, id: Date.now().toString() };
          this.fakeUsers.push(newUser);
          return of(new HttpResponse({
            status: 201,
            body: { data: newUser }
          }));
        }

        // Get user profile
        if (url.includes('/user') && method === 'GET' && !url.includes('getByUserId')) {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeUsers[0] }
          }));
        }

        // Update user
        if (url.includes('/user') && method === 'PUT') {
          const updatedUser = { ...this.fakeUsers[0], ...body };
          this.fakeUsers[0] = updatedUser;
          return of(new HttpResponse({
            status: 200,
            body: { data: updatedUser }
          }));
        }

        // Get services
        if (url.includes('/services') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeServices }
          }));
        }

        // Get available time slots
        if (url.includes('/scheduling/getavailabletimeslots') && method === 'GET') {
          const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
          return of(new HttpResponse({
            status: 200,
            body: { data: times }
          }));
        }

        // Schedule appointment
        if (url.includes('/scheduling') && method === 'POST' && !url.includes('getavailabletimeslots')) {
          const newSchedule = { ...body, id: Date.now().toString() };
          this.fakeSchedules.push(newSchedule);
          return of(new HttpResponse({
            status: 201,
            body: { data: newSchedule }
          }));
        }

        // Get company by user ID
        if (url.includes('/company/getByUserId') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeCompanies[0] }
          }));
        }

        // Get company by ID
        if (url.includes('/company/') && method === 'GET' && !url.includes('getByUserId') && !url.includes('checkurlisvalid') && !url.includes('getbyschedulingurl') && !url.includes('getServicesOferred') && !url.includes('getProfessionals')) {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeCompanies[0] }
          }));
        }

        // Get company by scheduling URL
        if (url.includes('/company/getbyschedulingurl') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeCompanies[0] }
          }));
        }

        // Check URL is valid
        if (url.includes('/company/checkurlisvalid') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: { data: true }
          }));
        }

        // Get services offered
        if (url.includes('/company/getServicesOferred') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeServices }
          }));
        }

        // Get professionals
        if (url.includes('/company/getProfessionals') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeProfessionals }
          }));
        }

        // Get schedules
        if (url.includes('/schedules') && method === 'GET') {
          return of(new HttpResponse({
            status: 200,
            body: { data: this.fakeSchedules }
          }));
        }

        // If no matching route, pass through to real backend
        return next.handle(request);
      }),
      materialize(),
      delay(500),
      dematerialize()
    );
  }
}

