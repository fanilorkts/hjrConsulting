import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "hjr_consulting",
  user: "myuser",
  password: "azerty",
});

export async function initDB(): Promise<void> {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sections (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(50) UNIQUE NOT NULL,
      template VARCHAR(50) NOT NULL DEFAULT 'home',
      css_class VARCHAR(100),
      title TEXT,
      subtitle TEXT,
      tagline TEXT,
      description TEXT,
      extra_data JSONB DEFAULT '{}',
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Migrations pour les colonnes ajoutees sur une BDD existante
  await pool.query(`ALTER TABLE sections ADD COLUMN IF NOT EXISTS template VARCHAR(50) NOT NULL DEFAULT 'home'`);
  await pool.query(`ALTER TABLE sections ADD COLUMN IF NOT EXISTS css_class VARCHAR(100)`);
  await pool.query(`ALTER TABLE sections ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS navigation_links (
      id SERIAL PRIMARY KEY,
      group_name VARCHAR(30) NOT NULL,
      link_key VARCHAR(100) NOT NULL,
      label VARCHAR(100) NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stats (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(50) NOT NULL DEFAULT 'intro',
      value VARCHAR(20) NOT NULL,
      label VARCHAR(100) NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`ALTER TABLE stats ADD COLUMN IF NOT EXISTS section_key VARCHAR(50) NOT NULL DEFAULT 'intro'`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS content_blocks (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(50),
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(50) NOT NULL DEFAULT 'services',
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS section_key VARCHAR(50) NOT NULL DEFAULT 'services'`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_items (
      id SERIAL PRIMARY KEY,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      label VARCHAR(200) NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skill_categories (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(50) NOT NULL DEFAULT 'competence',
      name VARCHAR(100) NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`ALTER TABLE skill_categories ADD COLUMN IF NOT EXISTS section_key VARCHAR(50) NOT NULL DEFAULT 'competence'`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_references (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(50) NOT NULL DEFAULT 'references',
      company VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`ALTER TABLE client_references ADD COLUMN IF NOT EXISTS section_key VARCHAR(50) NOT NULL DEFAULT 'references'`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_info (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(50) NOT NULL DEFAULT 'contact',
      icon VARCHAR(50) NOT NULL,
      title VARCHAR(100) NOT NULL,
      value TEXT NOT NULL,
      href VARCHAR(255),
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS section_key VARCHAR(50) NOT NULL DEFAULT 'contact'`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_config (
      id SERIAL PRIMARY KEY,
      config_key VARCHAR(100) UNIQUE NOT NULL,
      config_value TEXT NOT NULL
    )
  `);

  console.log("Toutes les tables sont pretes.");
}

export default pool;
