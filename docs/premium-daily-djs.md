# Radar Diário Premium — faixas e memória musical

Implementação atualizada em 02/09/2026. Build `20260902radarcommerce1`.

## Experiência atual

O novo **Radar Diário** aparece na descoberta e entrega três faixas com funções diferentes:

- **Afinidade:** próxima dos estilos e sinais positivos do usuário.
- **Ponte:** conecta o gosto atual a uma direção adjacente.
- **Fora da bolha:** introduz contraste controlado sem abandonar música eletrônica.

A seleção evita faixas curtidas ou rejeitadas, reduz repetição recente e não muda durante o mesmo dia. Os botões **Curti**, **Já conheço** e **Não combina** atualizam a memória usada nos dias seguintes. Usuários autenticados sincronizam estado e histórico com a própria conta; sem login, a experiência usa armazenamento local.

O radar anterior de DJs permanece como prévia complementar, mas a proposta vendável do Premium agora é o radar de **faixas**.

## Acesso e venda

- O Free mantém descoberta e curtidas ilimitadas.
- O Premium é liberado somente por direito confirmado no servidor.
- No site, a interface usa Stripe Checkout e Stripe Customer Portal.
- No iOS, a interface usa StoreKit 2 e oferece compra, restauração e gerenciamento na App Store.
- O mesmo usuário Supabase recebe acesso nos dois dispositivos, independentemente do canal de compra.
- Nenhuma cobrança está ativa: `SONIC_BILLING_ENABLED=false` até os produtos e testes externos serem concluídos.

## Verificação

- Testes do algoritmo, segurança da assinatura e curtidas ilimitadas aprovados.
- Build web e pacote iOS aprovados.
- Compilação Swift/iOS Simulator aprovada.
- Interface conferida em desktop e celular, com controles acessíveis e layout sem overflow.
- Estado de produção do Supabase preparado e verificado.

Consulte `docs/saas-readiness-2026-09-02.md` para o checklist de Stripe, App Store Connect, Vercel e sandbox.
