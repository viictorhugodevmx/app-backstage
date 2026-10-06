type AccountScreenProps = {
  user: {
    name: string;
    email?: string;
  } | null;
};

export function AccountScreen({ user }: AccountScreenProps) {
  return (
    <main style={{ maxWidth: 720, margin: '64px auto', padding: 24 }}>
      <p>BACKSTAGE · PRODUCCIÓN DE EVENTOS</p>
      <h1 style={{ margin: '16px 0' }}>Tu cuenta</h1>

      {user ? (
        <>
          <p>Sesión iniciada como {user.name}.</p>
          {user.email ? <p>{user.email}</p> : null}
          <p style={{ margin: '16px 0' }}>
            Tu sesión está lista para trabajar con Backstage.
          </p>
          <a href="/auth/logout">Cerrar sesión</a>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 16 }}>
            Inicia sesión para acceder a la producción de eventos.
          </p>
          <a href="/auth/login?returnTo=%2Faccount">Iniciar sesión</a>
        </>
      )}
    </main>
  );
}
