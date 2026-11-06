import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacidad — RB Fitness',
  description: 'Qué datos guarda RB Fitness, para qué se usan y cómo eliminarlos.',
};

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function PrivacyPage() {
  return (
    <main className="legal">
      <Link href="/" className="legal-back">
        <ArrowLeft size={16} /> Volver a RB
      </Link>
      <span className="overline">PRIVACIDAD</span>
      <h1>Tus datos son tuyos.</h1>
      <p className="legal-date">Última actualización: 2 de noviembre de 2026</p>

      <section>
        <h2>Qué guardamos</h2>
        <ul>
          <li>
            Tu correo y tu contraseña para entrar. La contraseña la gestiona el servicio de autenticación y se
            guarda cifrada; RB no puede verla.
          </li>
          <li>
            Tu perfil: nombre, gimnasio, objetivo, días por semana, unidad de peso y, si lo escribes, tu peso
            corporal.
          </li>
          <li>
            Tus rutinas y tu historial de entrenamientos: ejercicios, series, peso, repeticiones, fechas y
            duración.
          </li>
        </ul>
        <p>Son datos de entrenamiento y bienestar. Solo se guardan los que tú escribes en la app.</p>
      </section>

      <section>
        <h2>Para qué los usamos</h2>
        <p>
          Únicamente para que la app funcione: iniciar sesión, mostrar tu progreso y mantener tus datos
          sincronizados entre tus dispositivos.
        </p>
      </section>

      <section>
        <h2>Dónde se guardan</h2>
        <p>
          En Supabase (autenticación y base de datos), con acceso restringido por cuenta: cada persona solo
          puede leer y escribir sus propios datos. La app se sirve desde Vercel. Ambos son proveedores de
          infraestructura y tratan los datos solo para prestarnos el servicio.
        </p>
      </section>

      <section>
        <h2>Lo que no hacemos</h2>
        <ul>
          <li>No vendemos ni compartimos tus datos con terceros.</li>
          <li>No mostramos publicidad.</li>
          <li>No usamos herramientas de analítica ni de seguimiento de terceros.</li>
        </ul>
      </section>

      <section>
        <h2>En tu dispositivo</h2>
        <p>
          Guardamos localmente tu sesión (para que no tengas que entrar cada vez), tu preferencia de tema
          claro u oscuro y el último correo usado para rellenar el formulario. Al cerrar sesión se borra la
          sesión.
        </p>
      </section>

      <section>
        <h2>Enlaces externos</h2>
        <p>
          El botón «Buscar video» abre una búsqueda en YouTube en una pestaña nueva. RB no envía tus datos a
          YouTube; a partir de ahí aplican las condiciones y la política de privacidad de Google.
        </p>
      </section>

      <section>
        <h2>Tus derechos</h2>
        <ul>
          <li>
            <strong>Ver y descargar:</strong> Perfil → Cuenta → «Descargar una copia de mis datos» (archivo
            JSON).
          </li>
          <li>
            <strong>Reiniciar:</strong> Perfil → «Borrar historial y rutinas» deja tu cuenta como el primer
            día.
          </li>
          <li>
            <strong>Eliminar tu cuenta:</strong> Perfil → «Eliminar mi cuenta». Se borran de inmediato y de
            forma definitiva tu cuenta, tu perfil, tus rutinas y tu historial. No se puede deshacer.
          </li>
        </ul>
      </section>

      <section>
        <h2>Salud y menores</h2>
        <p>
          RB es un registro personal de entrenamiento, no un servicio médico: consulta a un profesional antes
          de cambiar tu actividad física si tienes dudas de salud. La app no está dirigida a menores de 13
          años.
        </p>
      </section>

      <section>
        <h2>Cambios y contacto</h2>
        <p>
          Si esta política cambia de forma relevante, actualizaremos la fecha de arriba y lo avisaremos en la
          app.
          {CONTACT ? (
            <>
              {' '}
              Para cualquier consulta sobre tus datos escribe a <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </>
          ) : null}
        </p>
      </section>
    </main>
  );
}
