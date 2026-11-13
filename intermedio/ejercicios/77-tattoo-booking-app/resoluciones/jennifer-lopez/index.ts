type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

interface TattooArtist {
  readonly id: string;
  readonly name: string;
  readonly specialties: readonly string[];
}

interface Booking {
  readonly id: string;
  readonly clientName: string;
  readonly artistId: string;
  readonly date: string;
  readonly time: string;
  readonly design: string;
  readonly estimatedPrice: number;
  readonly status: BookingStatus;
}

interface NewBooking {
  readonly clientName: string;
  readonly artistId: string;
  readonly date: string;
  readonly time: string;
  readonly design: string;
  readonly estimatedPrice: number;
}

type BookingResult =
  | { readonly success: true; readonly booking: Booking }
  | { readonly success: false; readonly message: string };

const artists: readonly TattooArtist[] = [
  { id: 'ana', name: 'Ana Torres', specialties: ['fine line', 'botanical'] },
  { id: 'marco', name: 'Marco Ruiz', specialties: ['traditional', 'blackwork'] },
];

class BookingRepository {
  private readonly bookings: Booking[] = [];

  list(): readonly Booking[] {
    return this.bookings;
  }

  save(booking: Booking): void {
    this.bookings.push(booking);
  }

  updateStatus(id: string, status: BookingStatus): boolean {
    const index = this.bookings.findIndex((booking) => booking.id === id);
    if (index < 0) return false;
    this.bookings[index] = { ...this.bookings[index], status };
    return true;
  }
}

class TattooBookingService {
  private nextId = 1;

  constructor(private readonly repository: BookingRepository) {}

  book(input: NewBooking): BookingResult {
    const artist = artists.find((candidate) => candidate.id === input.artistId);
    if (!input.clientName.trim() || !input.design.trim()) {
      return { success: false, message: 'Ingresa el nombre y la idea del tatuaje.' };
    }
    if (!artist) return { success: false, message: 'Selecciona un artista disponible.' };
    if (!isValidDate(input.date) || input.date < today()) {
      return { success: false, message: 'La fecha debe ser hoy o posterior.' };
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
      return { success: false, message: 'Selecciona una hora válida.' };
    }
    if (!Number.isFinite(input.estimatedPrice) || input.estimatedPrice <= 0) {
      return { success: false, message: 'El precio estimado debe ser mayor que cero.' };
    }
    const conflict = this.repository.list().some((booking) =>
      booking.artistId === input.artistId &&
      booking.date === input.date &&
      booking.time === input.time &&
      booking.status !== 'cancelled',
    );
    if (conflict) return { success: false, message: 'Ese horario ya está reservado.' };

    const booking: Booking = {
      ...input,
      id: `cita-${this.nextId++}`,
      clientName: input.clientName.trim(),
      design: input.design.trim(),
      status: 'confirmed',
    };
    this.repository.save(booking);
    return { success: true, booking };
  }

  cancel(bookingId: string): boolean {
    const booking = this.repository.list().find((candidate) => candidate.id === bookingId);
    return booking?.status === 'confirmed' &&
      this.repository.updateStatus(bookingId, 'cancelled');
  }
}

function today(): string {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function isValidDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

const repository = new BookingRepository();
const bookingService = new TattooBookingService(repository);

function createField(
  labelText: string,
  name: string,
  type: string,
  value = '',
): HTMLInputElement {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.name = name;
  input.type = type;
  input.value = value;
  input.required = true;
  label.append(input);
  document.getElementById('booking-form')?.append(label);
  return input;
}

function mountBookingApp(): void {
  const app = document.createElement('main');
  app.innerHTML = '<h1>Reserva tu tatuaje</h1><form id="booking-form"></form><p id="booking-message" aria-live="polite"></p><ul id="booking-list"></ul>';
  document.body.append(app);

  const name = createField('Tu nombre', 'clientName', 'text');
  const date = createField('Fecha', 'date', 'date');
  date.min = today();
  const time = createField('Hora', 'time', 'time');
  const design = createField('Idea del tatuaje', 'design', 'text');
  const price = createField('Precio estimado (COP)', 'estimatedPrice', 'number');
  price.min = '1';

  const form = document.getElementById('booking-form') as HTMLFormElement;
  const artistLabel = document.createElement('label');
  artistLabel.textContent = 'Artista';
  const artistSelect = document.createElement('select');
  artistSelect.name = 'artistId';
  artists.forEach((artist) => {
    const option = document.createElement('option');
    option.value = artist.id;
    option.textContent = `${artist.name} — ${artist.specialties.join(', ')}`;
    artistSelect.append(option);
  });
  artistLabel.append(artistSelect);
  form.append(artistLabel);
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Reservar cita';
  form.append(submit);

  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();
    const result = bookingService.book({
      clientName: name.value,
      artistId: artistSelect.value,
      date: date.value,
      time: time.value,
      design: design.value,
      estimatedPrice: Number(price.value),
    });
    const message = document.getElementById('booking-message');
    if (message) message.textContent = result.success ? '¡Cita confirmada!' : result.message;
    if (result.success) renderBookings();
  });
  renderBookings();
}

function renderBookings(): void {
  const list = document.getElementById('booking-list');
  if (!list) return;
  list.replaceChildren();
  repository.list().forEach((booking) => {
    const artist = artists.find((candidate) => candidate.id === booking.artistId);
    const item = document.createElement('li');
    const details = document.createElement('span');
    details.textContent = `${booking.clientName}: ${booking.design} con ${artist?.name ?? 'artista'} — ${booking.date} ${booking.time} (${booking.status}), $${booking.estimatedPrice.toLocaleString('es-CO')}`;
    item.append(details);
    if (booking.status === 'confirmed') {
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.textContent = 'Cancelar';
      cancelButton.addEventListener('click', () => {
        bookingService.cancel(booking.id);
        renderBookings();
      });
      item.append(cancelButton);
    }
    list.append(item);
  });
}

const sample = bookingService.book({
  clientName: 'Juan Pérez',
  artistId: 'ana',
  date: today(),
  time: '10:00',
  design: 'Rama de olivo fine line',
  estimatedPrice: 180_000,
});
const duplicate = bookingService.book({
  clientName: 'Lucía Gómez',
  artistId: 'ana',
  date: today(),
  time: '10:00',
  design: 'Flor pequeña',
  estimatedPrice: 120_000,
});
console.log('Booking tattoo app:', {
  citaCreada: sample.success,
  citasGuardadas: repository.list().length,
  casoLimite: duplicate.success ? 'horario duplicado aceptado' : duplicate.message,
});

if (typeof document !== 'undefined') mountBookingApp();
