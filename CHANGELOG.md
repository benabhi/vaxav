# Changelog

All notable changes to the Vaxav project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Laravel installation
- Database migrations
- Authentication system
- Pilot creation system
- Tick processing system

## [0.1.0] - 2025-11-30

### Added
- Initial project structure
- Docker setup with PHP 8.2, PostgreSQL 15, Redis, Nginx
- Docker Compose configuration with services:
  - app (Laravel PHP-FPM)
  - web (Nginx)
  - db (PostgreSQL)
  - redis (Redis)
  - queue (Laravel Queue Worker)
  - scheduler (Laravel Task Scheduler)
- Development scripts (setup.sh, start.sh, stop.sh)
- Complete PRD documentation (11 files)
- Environment configuration template (.env.example)
- Composer.json with Laravel dependencies
- Package.json with Vite and Tailwind
- Frontend configuration:
  - Tailwind CSS with Void Command theme
  - Vite build system
  - Alpine.js integration
  - Custom CSS animations and effects
- README.md with complete setup instructions
- NEXT_STEPS.md with development roadmap
- Git repository initialized
- First push to GitHub (https://github.com/benabhi/vaxav)

### Infrastructure
- Docker containers ready for development
- PostgreSQL database configured
- Redis cache and session storage
- Nginx web server configured
- PHP 8.2 with required extensions:
  - pdo_pgsql
  - redis
  - mbstring
  - exif
  - pcntl
  - bcmath
  - gd

### Documentation
- Complete PRD in Spanish (4,400+ lines)
- Technical architecture documented
- Database schema designed (27+ tables)
- API structure planned
- Development roadmap created
- Setup and deployment guides

### Theme
- Void Command sci-fi theme implemented
- Custom color palette (void, neon)
- Orbitron + Inter fonts
- Reusable UI components
- Progress bars and animations
- Glow effects and neon styling

## Version History

- **0.1.0** - Initial project structure and Docker setup
- **Unreleased** - Laravel installation and core features

---

## Commit History

### 2025-11-30
- `71b29c5` Add frontend configuration and Void Command theme
- `2b09f62` Add development roadmap and next steps documentation
- `f413875` Initial commit: Vaxav project structure
