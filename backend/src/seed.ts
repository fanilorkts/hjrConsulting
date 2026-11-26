import pool, { initDB } from "./db";

async function seed(): Promise<void> {
  await initDB();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Vider les tables existantes
    await client.query(`
      TRUNCATE navigation_links, stats, content_blocks,
               service_items, services, skills, skill_categories,
               client_references, contact_info, site_config, sections
      CASCADE
    `);

    // --- sections (avec template et css_class) ---
    await client.query(`
      INSERT INTO sections (section_key, template, css_class, title, subtitle, tagline, description, extra_data, display_order) VALUES
        ('intro', 'home', 'section-home', NULL, NULL, 'TECH LEAD / EXPERT INTEGRATION',
         'Plus de 20 ans d''expertise en intégration systèmes, architecture applicative et pilotage de projet IT pour des grand comptes',
         '{"title": "Architecture Application & Intégration de Système", "discover": "Découvrez nos services"}',
         1),
        ('a-propos', 'text-blocks', 'section-text-blocks', 'A propos', 'Qui sommes-nous ?', NULL, NULL,
         '{"left-title": "HJR Consulting", "left-description": ["Fondé par <strong>Haja Razafindrazaka</strong>, ingénieur en informatique diplômé de l''Ecole Nationale d''Informatique et titulaire d''un Master 2 en Management de l''IAE Paris - Sorbonne Business School, <strong>HJR Consulting</strong> est un cabinet de conseil spécialisé dans l''intégration de systèmes et l''architecture applicative.", "Fort de plus de <strong>20 ans d''expérience</strong> au sein de grands comptes tels que la Banque de France, GEFCO, COVEA, l''Oréal ou encore Total, nous accompagnons les entreprises dans leurs projets de transformation digitale, de la conception à la mise en production.", "Notre approche allie expertise technique pointue et vision stratégique, pour des solutions robustes, évolutives et alignées avec vos objectifs métiers."]}',
         2),
        ('services', 'listing', 'section-listing', 'Nos services', 'Quels sont les services que nous proposons', NULL, NULL, '{}', 3),
        ('expertise', 'icon-grid', 'section-icon-grid', 'Nos Domaines d''Expertise', 'Des solutions sur mesure pour répondre aux enjeux de votre système d''information', NULL, NULL, '{}', 4),
        ('competence', 'badge-grid', 'section-badge-grid', 'Compétences Techniques', 'Un large spectre technologique maîtrisé', NULL, NULL, '{}', 5),
        ('references', 'card-grid', 'section-card-grid', 'Nos Références', 'Des clients prestigieux qui nous font confiance', NULL, NULL, '{}', 6),
        ('contact', 'contact', 'section-contact', 'Contactez-nous', 'Discutons de votre projet', NULL, NULL,
         '{"form": {"name": "Nom", "email": "Email", "subject": "Sujet", "message": "Votre message..."}, "button": "Envoyer votre message"}',
         7)
    `);

    // --- navigation_links ---
    await client.query(`
      INSERT INTO navigation_links (group_name, link_key, label, display_order) VALUES
        ('header', 'a-propos', 'A propos', 1),
        ('header', 'services', 'Services', 2),
        ('header', 'expertise', 'Expertise', 3),
        ('header', 'competence', 'Compétences', 4),
        ('header', 'references', 'Références', 5),
        ('header', 'contact', 'Contact', 6),
        ('footer_nav', 'a-propos', 'A propos', 1),
        ('footer_nav', 'services', 'Services', 2),
        ('footer_nav', 'expertise', 'Expertise', 3),
        ('footer_nav', 'competence', 'Compétences', 4),
        ('footer_nav', 'references', 'Références', 5),
        ('footer_nav', 'contact', 'Contact', 6),
        ('footer_services', 'integration', 'Intégration', 1),
        ('footer_services', 'architecture', 'Architecture', 2),
        ('footer_services', 'maintenance', 'Maintenance', 3),
        ('footer_services', 'gestion de projet', 'Gestion de Projets', 4)
    `);

    // --- stats ---
    await client.query(`
      INSERT INTO stats (section_key, value, label, display_order) VALUES
        ('intro', '20+', 'Année d''expérience', 1),
        ('intro', '10+', 'Grands comptes', 2),
        ('intro', '30+', 'Projets livrés', 3)
    `);

    // --- content_blocks (a-propos) ---
    await client.query(`
      INSERT INTO content_blocks (section_key, title, description, icon, display_order) VALUES
        ('a-propos', 'Fiabilité', 'Des engagements tenus et une rigueur issue du secteur bancaire et financier.', 'bi-shield', 1),
        ('a-propos', 'Polyvalence', 'Une maîtrise complète de la chaîne technique : du développement fullstack au DevOps.', 'bi-globe', 2),
        ('a-propos', 'Accompagnement', 'Un suivi personnalisé et une communication transparente à chaque étape du projet.', 'bi-people', 3),
        ('a-propos', 'Performance', 'Des solutions optimisées, de la conception à la mise en production et au-delà.', 'bi-graph-up', 4)
    `);

    // --- content_blocks (expertise) ---
    await client.query(`
      INSERT INTO content_blocks (section_key, title, description, icon, display_order) VALUES
        ('expertise', 'Intégration de Système', 'Construction d''interfaces inter-applicatives : APIM, MFT, ESB, SOAP, REST, MicroServices, Graph API, Automatisation de processus métier (BPM).', 'bi-diagram-3', 1),
        ('expertise', 'Architecture Applicative', 'Conception d''architectures REST, SOAP, Micro Services, Urbanisation du SI. Mise en place de CI/CD on-premise et cloud (OpenShift, Docker).', 'bi-building', 2),
        ('expertise', 'Maintenance & Optimisation', 'Gestion du bon fonctionnement, maintenance et optimisation d''application. Pilotage des migrations et évolutions techniques. Support à l''exploitation.', 'bi-tools', 3),
        ('expertise', 'Gestion de Projet & AMOA', 'Pilotage de projets, encadrement d''équipes, recueil et analyse de besoins, rédaction de spécifications, animation d''ateliers et conduite de la recette.', 'bi-kanban', 4)
    `);

    // --- services + service_items ---
    const svc1 = await client.query(`
      INSERT INTO services (section_key, title, description, display_order) VALUES
        ('services', 'Développement Web & mobile', 'Création d''applications web et mobile sur mesure, adaptées à vos besoins spécifiques. Nous utilisons les dernières technologies pour garantir performance et évolutivité.', 1)
      RETURNING id
    `);
    await client.query(`
      INSERT INTO service_items (service_id, label, display_order) VALUES
        ($1, 'Applications web progressives (PWA)', 1),
        ($1, 'Applications mobiles natives et hybrides', 2),
        ($1, 'E-commerce et marketplaces', 3),
        ($1, 'Plateformes SaaS', 4)
    `, [svc1.rows[0].id]);

    const svc2 = await client.query(`
      INSERT INTO services (section_key, title, description, display_order) VALUES
        ('services', 'Solutions Cloud', 'Migration, hébergement et gestion de vos infrastructures cloud. Nous vous accompagnons dans votre transition vers le cloud avec AWS, Azure et Google Cloud.', 2)
      RETURNING id
    `);
    await client.query(`
      INSERT INTO service_items (service_id, label, display_order) VALUES
        ($1, 'Migration vers le cloud', 1),
        ($1, 'Architecture cloud native', 2),
        ($1, 'Optimisation des coûts', 3)
    `, [svc2.rows[0].id]);

    // --- skill_categories + skills ---
    const categories = [
      { name: "Languages", badges: ["Java", "TypeScript", "JavaScript", "C#", "Python", "Shell", "PL/SQL"] },
      { name: "Frameworks & Outils", badges: ["Spring Boot", "Angular", "Django", "RabbitMQ", "NodeJS", "ASP.NET"] },
      { name: "DevOps & CI/CD", badges: ["Docker", "OpenShift", "GitLab", "Jenkins", "Maven", "Sonar", "Artifactory"] },
      { name: "Bases de Données", badges: ["PostgreSQL", "SQL Server", "Oracle", "MySQL"] },
      { name: "Architecture & Intégration", badges: ["REST", "SOAP", "Micro Services", "APIM", "ESB", "MFT", "SSIS"] },
      { name: "Sécurité & Réseaux", badges: ["OAuth2", "OIDC", "SAMLv2", "Kerberos", "SSL/TLS", "Graph API"] },
    ];
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const catResult = await client.query(
        "INSERT INTO skill_categories (section_key, name, display_order) VALUES ('competence', $1, $2) RETURNING id",
        [cat.name, i + 1]
      );
      for (let j = 0; j < cat.badges.length; j++) {
        await client.query(
          "INSERT INTO skills (category_id, name, display_order) VALUES ($1, $2, $3)",
          [catResult.rows[0].id, cat.badges[j], j + 1]
        );
      }
    }

    // --- client_references ---
    await client.query(`
      INSERT INTO client_references (section_key, company, description, display_order) VALUES
        ('references', 'Banque de France', 'Tech Lead Expert - Architecture Applicative, Intégration de système, développement fullStack.', 1),
        ('references', 'GEFCO Corporate', 'Business Analyst AMOA/AMOE - Système d''échange de flux, intégration TMS.', 2),
        ('references', 'COVEA Immobilier', 'Chef de projet - Dématérialisation, gestion de processus, migrations techniques.', 3)
    `);

    // --- contact_info ---
    await client.query(`
      INSERT INTO contact_info (section_key, icon, title, value, href, display_order) VALUES
        ('contact', 'bi-geo-alt', 'Adresse', 'Paris, France', NULL, 1),
        ('contact', 'bi-envelope', 'Email', 'contact@hjr-consulting.fr', 'mailto:contact@hjr-consulting.fr', 2),
        ('contact', 'bi-telephone', 'Téléphone', '+33 (0)1 XX XX XX XX', 'tel:+33100000000', 3)
    `);

    // --- site_config (footer) ---
    await client.query(`
      INSERT INTO site_config (config_key, config_value) VALUES
        ('footer_subtitle', 'Expert en intégration de système et applicative depuis plus de 20 ans.')
    `);

    await client.query("COMMIT");
    console.log("Donnees inserees avec succes.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erreur lors du seed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
