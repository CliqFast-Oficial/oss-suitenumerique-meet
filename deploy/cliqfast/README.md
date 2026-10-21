# Reunião CliqFast

Deploy do Meet (La Suite numérique) da CliqFast: `reuniao.cliqfast.com.br`, até ~5 pessoas por sala.

- **Onde:** servidor da casa (VM `cliqfast-sandbox`), projeto `sandbox` **meet**, código em `~/sandbox/meet/code`,
  segredos em `~/sandbox/meet/config/.env` (modelo: `env.example`), banco no volume `meet-db`.
- **Entrada:** túnel do Cloudflare `cliqfast-sandbox` → `127.0.0.1:8095` (proxy nginx deste Compose). Sem Access no site:
  convidados entram pelo link da sala; só criar sala exige login.
- **Vídeo:** LiveKit Cloud (o túnel não passa UDP). **Login:** Google, só para a equipe ativa da CliqGestão
  (`core/cliqgestao.py` pergunta a `/integracoes/meet/equipe`); admin na CliqGestão é admin aqui.
- **Marca:** `public/assets/cliqfast.css` (cores), `logo-cliqfast.png` e ícones; `acesso-negado.html` para quem não é da equipe.
- **Branches:** `main` espelha o original (o catálogo Open source da CliqGestão mantém o fork atualizado);
  `cliqfast` tem a tradução pt-BR, a marca e este deploy. Para atualizar: merge da tag nova do original em `cliqfast`.

```bash
sandbox up        # sincroniza e sobe (constrói as imagens na primeira vez)
sandbox rebuild   # depois de mudar código ou tradução
sandbox logs
ssh cliqfast-sandbox-cloud 'cd ~/sandbox/meet/code && docker compose -p meet -f deploy/cliqfast/compose.yaml exec backend python manage.py migrate'
```
