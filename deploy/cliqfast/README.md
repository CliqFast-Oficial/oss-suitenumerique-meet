# Reunião CliqFast

Deploy do Meet (La Suite numérique) da CliqFast: `reuniao.cliqfast.com.br`, até ~5 pessoas por sala.

- **Onde:** VPS da CliqGestão (alias SSH `cliqgestao-vps`), projeto Compose `meet`, código em `/opt/meet/code`,
  segredos em `/opt/meet/config/.env` (modelo: `env.example`), banco no volume `meet-db`, `pg_dump` diário em `meet-backups`.
  Desde 21/10/2026; antes ficava na VM da casa (removido de lá; a cópia da migração está em `/opt/meet/migracao`).
- **Entrada:** DNS direto para a VPS (somente DNS no Cloudflare); o Caddy da CliqGestão (`MEET_DOMAIN`) faz o HTTPS e
  repassa para o proxy nginx deste Compose, que entra na rede dela como `meet-proxy:8083`. Sem Access no site:
  convidados entram pelo link da sala; só criar sala exige login.
- **Vídeo:** LiveKit Cloud. **Login:** Google, só para a equipe ativa da CliqGestão
  (`core/cliqgestao.py` pergunta a `/integracoes/meet/equipe`); admin na CliqGestão é admin aqui.
- **Marca:** `public/assets/cliqfast.css` (cores), `logo-cliqfast.png` e ícones; `acesso-negado.html` para quem não é da equipe.
- **Branches:** `main` espelha o original (o catálogo Open source da CliqGestão mantém o fork atualizado);
  `cliqfast` tem a tradução pt-BR, a marca e este deploy. Para atualizar: merge da tag nova do original em `cliqfast`.

```bash
deploy/cliqfast/publicar.sh            # prévia do que o rsync enviaria (nada muda)
deploy/cliqfast/publicar.sh --apply    # envia o código e reconstrói/sobe os serviços
deploy/cliqfast/publicar.sh status     # contêineres e saúde
deploy/cliqfast/publicar.sh logs backend
deploy/cliqfast/publicar.sh migrate    # migrações do Django
```
