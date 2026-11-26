import { Request, Response } from "express";
import pool from "../db";

export async function getPortfolioData(_req: Request, res: Response): Promise<void> {
  try {
    // Charger toutes les donnees en parallele
    const [
      sectionsResult,
      configResult,
      navLinksResult,
      statsResult,
      contentBlocksResult,
      servicesResult,
      serviceItemsResult,
      categoriesResult,
      skillsResult,
      referencesResult,
      contactInfoResult,
    ] = await Promise.all([
      pool.query("SELECT * FROM sections ORDER BY display_order"),
      pool.query("SELECT * FROM site_config"),
      pool.query("SELECT * FROM navigation_links ORDER BY display_order"),
      pool.query("SELECT * FROM stats ORDER BY display_order"),
      pool.query("SELECT * FROM content_blocks ORDER BY display_order"),
      pool.query("SELECT * FROM services ORDER BY display_order"),
      pool.query("SELECT * FROM service_items ORDER BY service_id, display_order"),
      pool.query("SELECT * FROM skill_categories ORDER BY display_order"),
      pool.query("SELECT * FROM skills ORDER BY category_id, display_order"),
      pool.query("SELECT * FROM client_references ORDER BY display_order"),
      pool.query("SELECT * FROM contact_info ORDER BY display_order"),
    ]);

    // Config map
    const config: Record<string, string> = {};
    for (const row of configResult.rows) {
      config[row.config_key] = row.config_value;
    }

    // Nav links groupes par group_name
    const navGroups: Record<string, any[]> = {};
    for (const row of navLinksResult.rows) {
      if (!navGroups[row.group_name]) navGroups[row.group_name] = [];
      navGroups[row.group_name].push(row);
    }

    // Header (objet key-value)
    const header: Record<string, string> = {};
    for (const link of (navGroups["header"] || [])) {
      header[link.link_key] = link.label;
    }

    // Content blocks groupes par section_key
    const blocksBySection: Record<string, any[]> = {};
    for (const row of contentBlocksResult.rows) {
      if (!blocksBySection[row.section_key]) blocksBySection[row.section_key] = [];
      blocksBySection[row.section_key].push(row);
    }

    // Stats groupes par section_key
    const statsBySection: Record<string, any[]> = {};
    for (const row of statsResult.rows) {
      if (!statsBySection[row.section_key]) statsBySection[row.section_key] = [];
      statsBySection[row.section_key].push(row);
    }

    // Services groupes par section_key
    const servicesBySection: Record<string, any[]> = {};
    for (const row of servicesResult.rows) {
      if (!servicesBySection[row.section_key]) servicesBySection[row.section_key] = [];
      servicesBySection[row.section_key].push(row);
    }

    // Service items groupes par service_id
    const serviceItemMap: Record<number, string[]> = {};
    for (const row of serviceItemsResult.rows) {
      if (!serviceItemMap[row.service_id]) serviceItemMap[row.service_id] = [];
      serviceItemMap[row.service_id].push(row.label);
    }

    // Skill categories groupees par section_key
    const categoriesBySection: Record<string, any[]> = {};
    for (const row of categoriesResult.rows) {
      if (!categoriesBySection[row.section_key]) categoriesBySection[row.section_key] = [];
      categoriesBySection[row.section_key].push(row);
    }

    // Skills groupes par category_id
    const skillMap: Record<number, string[]> = {};
    for (const row of skillsResult.rows) {
      if (!skillMap[row.category_id]) skillMap[row.category_id] = [];
      skillMap[row.category_id].push(row.name);
    }

    // References groupees par section_key
    const refsBySection: Record<string, any[]> = {};
    for (const row of referencesResult.rows) {
      if (!refsBySection[row.section_key]) refsBySection[row.section_key] = [];
      refsBySection[row.section_key].push(row);
    }

    // Contact info groupees par section_key
    const contactBySection: Record<string, any[]> = {};
    for (const row of contactInfoResult.rows) {
      if (!contactBySection[row.section_key]) contactBySection[row.section_key] = [];
      contactBySection[row.section_key].push(row);
    }

    // Footer
    const footerNav: Record<string, string> = { title: "Navigation" };
    for (const link of (navGroups["footer_nav"] || [])) {
      footerNav[link.link_key] = link.label;
    }
    const footerServices: Record<string, string> = { title: "Services" };
    for (const link of (navGroups["footer_services"] || [])) {
      footerServices[link.link_key] = link.label;
    }

    // Construire le tableau de sections
    const sections = sectionsResult.rows.map((s: any) => {
      const extra = s.extra_data || {};
      const key = s.section_key;

      let data: any = {};

      switch (s.template) {
        case "home":
          data = {
            tagline: s.tagline,
            title: extra.title || s.title,
            description: s.description,
            discover: extra.discover,
            stats: (statsBySection[key] || []).map((r: any) => ({
              value: r.value,
              label: r.label,
            })),
          };
          break;

        case "text-blocks":
          data = {
            "section-title": s.title,
            "section-subtitle": s.subtitle,
            "left-title": extra["left-title"],
            "left-description": extra["left-description"] || [],
            block: (blocksBySection[key] || []).map((r: any) => ({
              title: r.title,
              description: r.description,
              icon: r.icon,
            })),
          };
          break;

        case "listing":
          data = {
            "section-title": s.title,
            "section-subtitle": s.subtitle,
            list: (servicesBySection[key] || []).map((r: any) => ({
              title: r.title,
              description: r.description,
              items: serviceItemMap[r.id] || [],
            })),
          };
          break;

        case "icon-grid":
          data = {
            "section-title": s.title,
            "section-subtitle": s.subtitle,
            list: (blocksBySection[key] || []).map((r: any) => ({
              title: r.title,
              description: r.description,
              icon: r.icon,
            })),
          };
          break;

        case "badge-grid":
          data = {
            "section-title": s.title,
            "section-subtitle": s.subtitle,
            list: (categoriesBySection[key] || []).map((r: any) => ({
              title: r.name,
              badges: skillMap[r.id] || [],
            })),
          };
          break;

        case "card-grid":
          data = {
            "section-title": s.title,
            "section-subtitle": s.subtitle,
            list: (refsBySection[key] || []).map((r: any) => ({
              title: r.company,
              description: r.description,
            })),
          };
          break;

        case "contact":
          data = {
            "section-title": s.title,
            "section-subtitle": s.subtitle,
            info: (contactBySection[key] || []).map((r: any) => ({
              icon: r.icon,
              title: r.title,
              value: r.value,
              href: r.href,
            })),
            form: extra.form || {},
            button: extra.button || "Envoyer",
          };
          break;
      }

      return {
        key,
        template: s.template,
        css: s.css_class,
        data,
      };
    });

    // Reponse finale (meme structure que data.json)
    const response = {
      header,
      sections,
      footer: {
        subtitle: config["footer_subtitle"],
        navigation: [footerNav],
        services: [footerServices],
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Erreur lors de la recuperation des donnees portfolio:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
