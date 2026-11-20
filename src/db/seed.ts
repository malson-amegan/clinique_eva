import { count } from 'drizzle-orm';
import { db } from './index.ts';
import {
  articles,
  faqs,
  galleryItems,
  institutionalPages,
  specialties,
} from './schema.ts';

let seedPromise: Promise<void> | null = null;

export async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = runSeedIfEmpty().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function runSeedIfEmpty() {
  const specCount = await db.select({ total: count() }).from(specialties);
  if (Number(specCount[0]?.total || 0) === 0) {
    await db
      .insert(specialties)
      .values([
        {
          slug: 'nephrologie',
          title: 'Néphrologie',
          shortDescription:
            'Suivi spécialisé, prévention et accompagnement des affections rénales à Agoè Démakpoé.',
          fullDescription:
            'Le pôle de néphrologie de la Clinique EVA accompagne les patients dans la prévention, le suivi médical et l’orientation des pathologies rénales. Ce contenu est présenté à titre informatif sous réserve de validation finale par la direction médicale de l’établissement.',
          practicalInfo:
            'Lieu : Clinique EVA, Agoè Démakpoé (derrière le Bar Le Sourire), Lomé. Prise de rendez-vous en ligne ou par téléphone au +228 90 72 20 01. Les modalités et disponibilités précises sont confirmées par le secrétariat lors du traitement de votre demande.',
          imageKey: 'nephrology',
          iconName: 'Activity',
          displayOrder: 1,
          isValidated: false,
          isPublished: true,
        },
        {
          slug: 'gynecologie',
          title: 'Gynécologie',
          shortDescription:
            'Consultations gynécologiques attentives, prévention et suivi de la santé féminine à chaque étape.',
          fullDescription:
            'Les consultations gynécologiques offrent un cadre d’écoute confidentiel et respectueux pour le suivi régulier, l’information préventive et l’orientation adaptée aux besoins de chaque patiente.',
          practicalInfo:
            'Consultations sur demande de rendez-vous via notre plateforme ou au +228 90 72 20 01. Les créneaux exacts sont confirmés par l’accueil de la Clinique EVA.',
          imageKey: 'womens',
          iconName: 'HeartHandshake',
          displayOrder: 2,
          isValidated: false,
          isPublished: true,
        },
        {
          slug: 'consultations-prenatales',
          title: 'Consultations prénatales',
          shortDescription:
            'Accompagnement rassurant des futures mamans tout au long de la grossesse.',
          fullDescription:
            'La Clinique EVA propose un suivi prénatal structuré pour accompagner les femmes enceintes avec bienveillance, régularité et clarté, en lien avec les recommandations de santé maternelle.',
          practicalInfo:
            'Demande de rendez-vous en ligne ou via WhatsApp (+228 90 72 20 01). Un membre du secrétariat confirme la date et l’heure de votre venue.',
          imageKey: 'womens',
          iconName: 'Baby',
          displayOrder: 3,
          isValidated: false,
          isPublished: true,
        },
        {
          slug: 'medecine-generale',
          title: 'Médecine générale',
          shortDescription:
            'Consultations de premier recours, bilans de santé et orientation personnalisée.',
          fullDescription:
            'La médecine générale constitue le point d’entrée privilégié pour l’évaluation globale de votre état de santé, le suivi des affections courantes et l’orientation coordonnée vers nos spécialités.',
          practicalInfo:
            'Demande de consultation accessible en ligne, par appel direct ou WhatsApp au +228 90 72 20 01.',
          imageKey: 'hero',
          iconName: 'Stethoscope',
          displayOrder: 4,
          isValidated: false,
          isPublished: true,
        },
        {
          slug: 'analyses-biomedicales',
          title: 'Analyses biomédicales',
          shortDescription:
            'Service dédié aux prélèvements et analyses biomédicales sur prescription ou orientation.',
          fullDescription:
            'La Clinique EVA met à disposition un service d’analyses biomédicales destiné à soutenir le suivi clinique et le dépistage. La liste précise des examens disponibles est communiquée directement par l’établissement selon les validations en vigueur.',
          practicalInfo:
            'Pour connaître les conditions de préparation et les créneaux de prélèvement confirmés par la clinique, veuillez contacter le +228 90 72 20 01 ou déposer une demande.',
          imageKey: 'lab',
          iconName: 'FlaskConical',
          displayOrder: 5,
          isValidated: false,
          isPublished: true,
        },
        {
          slug: 'imagerie-medicale',
          title: 'Imagerie médicale',
          shortDescription:
            'Service d’imagerie médicale sur rendez-vous pour accompagner votre parcours de soins.',
          fullDescription:
            'Le service d’imagerie médicale accompagne les consultations cliniques et spécialisées. Les modalités d’examen et les disponibilités sont confirmées exclusivement par l’équipe d’accueil de la clinique lors de la prise de rendez-vous.',
          practicalInfo:
            'Prise de rendez-vous préalable recommandée en ligne ou au +228 90 72 20 01 afin de vérifier la disponibilité du service.',
          imageKey: 'lab',
          iconName: 'ScanLine',
          displayOrder: 6,
          isValidated: false,
          isPublished: true,
        },
      ])
      .onConflictDoNothing();
  }

  const instCount = await db
    .select({ total: count() })
    .from(institutionalPages);
  if (Number(instCount[0]?.total || 0) === 0) {
    await db
      .insert(institutionalPages)
      .values([
        {
          slug: 'presentation',
          title: 'Présentation de la Clinique EVA',
          body: 'Située à Agoè Démakpoé, Lomé (derrière le Bar Le Sourire), la Clinique EVA est un établissement de santé de proximité dédié à l’écoute, à la clarté du parcours patient et au suivi médical attentif.',
          isValidated: false,
        },
        {
          slug: 'mission',
          title: 'Notre mission',
          body: 'Offrir aux habitants d’Agoè et du Grand Lomé un accès simple, humain et structuré aux consultations de néphrologie, de gynécologie, de suivi prénatal, de médecine générale, ainsi qu’aux services d’analyses et d’imagerie.',
          isValidated: false,
        },
        {
          slug: 'valeurs',
          title: 'Nos valeurs',
          body: 'Accueil bienveillant, confidentialité des échanges, rigueur professionnelle et clarté dans l’information médicale et administrative.',
          isValidated: false,
        },
        {
          slug: 'approche',
          title: 'Notre approche de prise en charge',
          body: 'Chaque patient bénéficie d’une orientation personnalisée : dès la demande de rendez-vous, le secrétariat veille à confirmer le créneau le plus adapté et à préparer l’accueil dans les meilleures conditions.',
          isValidated: false,
        },
        {
          slug: 'infos-pratiques',
          title: 'Informations pratiques',
          body: 'Localisation : Agoè Démakpoé, Lomé, Togo (repère : derrière le Bar Le Sourire). Contact direct : +228 90 72 20 01 (appel téléphonique et WhatsApp). Les horaires précis et modalités d’accueil sont confirmés par le secrétariat.',
          isValidated: false,
        },
      ])
      .onConflictDoNothing();
  }

  const faqCount = await db.select({ total: count() }).from(faqs);
  if (Number(faqCount[0]?.total || 0) === 0) {
    await db.insert(faqs).values([
      {
        question: 'Où se trouve la Clinique EVA ?',
        answer:
          'La Clinique EVA est située à Agoè Démakpoé, à Lomé (Togo), avec pour repère principal : derrière le Bar Le Sourire.',
        category: 'Localisation',
        displayOrder: 1,
        isValidated: true,
        isPublished: true,
      },
      {
        question: 'Comment prendre rendez-vous à la Clinique EVA ?',
        answer:
          'Vous pouvez soumettre une demande de rendez-vous directement sur cette plateforme en choisissant votre spécialité et un créneau souhaité, ou nous joindre par téléphone / WhatsApp au +228 90 72 20 01. Votre demande reste en attente jusqu’à sa confirmation officielle par notre secrétariat.',
        category: 'Rendez-vous',
        displayOrder: 2,
        isValidated: true,
        isPublished: true,
      },
      {
        question: 'Quels services et spécialités sont proposés ?',
        answer:
          'La clinique annonce des consultations et services en néphrologie, gynécologie, consultations prénatales, médecine générale, analyses biomédicales et imagerie médicale.',
        category: 'Services',
        displayOrder: 3,
        isValidated: true,
        isPublished: true,
      },
      {
        question: 'Comment contacter la clinique rapidement ?',
        answer:
          'Vous pouvez appeler directement le +228 90 72 20 01, écrire via WhatsApp au même numéro, ou utiliser le formulaire de contact disponible dans la rubrique Contact.',
        category: 'Contact',
        displayOrder: 4,
        isValidated: true,
        isPublished: true,
      },
      {
        question: 'Comment obtenir des informations sur les dépistages ?',
        answer:
          'Consultez notre rubrique Prévention & Dépistage (hypertension artérielle et diabète) et cliquez sur « Demander des informations » pour être rappelé ou renseigné par la clinique.',
        category: 'Prévention',
        displayOrder: 5,
        isValidated: true,
        isPublished: true,
      },
    ]);
  }

  const artCount = await db.select({ total: count() }).from(articles);
  if (Number(artCount[0]?.total || 0) === 0) {
    await db
      .insert(articles)
      .values([
        {
          slug: 'comprendre-suivi-sante-renale',
          title: 'Préserver sa santé rénale : les repères essentiels',
          category: 'Santé rénale',
          excerpt:
            'Pourquoi un suivi médical régulier et la surveillance de la tension artérielle jouent un rôle clé dans la protection des reins.',
          content:
            'Les maladies rénales évoluent souvent de manière silencieuse durant les premières années. Un suivi médical attentif, l’hydratation adaptée et la surveillance des facteurs de risque comme l’hypertension ou le diabète permettent d’agir tôt.\n\nCet article est présenté à titre d’exemple éditorial et doit faire l’objet d’une validation par un professionnel de santé de la Clinique EVA avant toute diffusion définitive. Il ne remplace en aucun cas une consultation médicale.',
          imageKey: 'nephrology',
          isMedicalApproved: false,
          isDemoContent: true,
          isPublished: true,
        },
        {
          slug: 'suivi-gynecologique-prevention-feminine',
          title: 'L’importance du suivi gynécologique régulier',
          category: 'Santé féminine',
          excerpt:
            'Comment la consultation gynécologique de routine contribue à la prévention, à l’écoute et au bien-être féminin.',
          content:
            'Consulter régulièrement permet d’aborder sereinement toutes les questions liées à la santé féminine, de bénéficier d’un accompagnement préventif et d’obtenir des réponses claires auprès d’un professionnel.\n\nContenu indicatif de démonstration en attente de validation médicale par l’établissement.',
          imageKey: 'womens',
          isMedicalApproved: false,
          isDemoContent: true,
          isPublished: true,
        },
        {
          slug: 'bien-preparer-consultations-prenatales',
          title: 'Accompagner sa grossesse grâce aux consultations prénatales',
          category: 'Grossesse et suivi prénatal',
          excerpt:
            'Les objectifs du suivi prénatal pour veiller au bon déroulement de la grossesse et rassurer les futures mamans.',
          content:
            'Les consultations prénatales offrent un espace régulier de surveillance clinique, d’information et d’écoute tout au long de la grossesse, afin de préparer l’accueil de l’enfant en toute sérénité.\n\nContenu indicatif de démonstration en attente de validation médicale par la Clinique EVA.',
          imageKey: 'womens',
          isMedicalApproved: false,
          isDemoContent: true,
          isPublished: true,
        },
        {
          slug: 'interet-depistage-diabete',
          title: 'Pourquoi s’informer sur le dépistage du diabète ?',
          category: 'Prévention du diabète',
          excerpt:
            'Comprendre l’intérêt d’un repérage précoce de la glycémie pour prévenir les complications métaboliques.',
          content:
            'Le dépistage du diabète permet d’identifier une élévation de la glycémie avant l’apparition de symptômes marqués et d’adapter son suivi avec un médecin.\n\nCet article constitue un contenu d’illustration en attente de validation par un professionnel de santé. Aucun diagnostic ni recommandation thérapeutique personnalisée ne peut être délivré en ligne.',
          imageKey: 'prevention',
          isMedicalApproved: false,
          isDemoContent: true,
          isPublished: true,
        },
        {
          slug: 'comprendre-depistage-hypertension-arterielle',
          title: 'Hypertension artérielle : comprendre l’intérêt du dépistage',
          category: 'Hypertension',
          excerpt:
            'Pourquoi la mesure régulière de la tension artérielle est un geste simple et fondamental de prévention.',
          content:
            'Souvent asymptomatique, l’hypertension artérielle nécessite une mesure fiable en consultation pour être identifiée à temps. Un repérage précoce protège durablement le cœur, les vaisseaux et les reins.\n\nContenu indicatif de démonstration soumis à validation médicale par la Clinique EVA.',
          imageKey: 'prevention',
          isMedicalApproved: false,
          isDemoContent: true,
          isPublished: true,
        },
        {
          slug: 'conseils-prevention-sante-quotidienne',
          title: 'Adopter des réflexes de prévention au quotidien',
          category: 'Conseils de santé générale',
          excerpt:
            'Quelques principes simples d’hygiène de vie et de suivi médical préventif à discuter lors de votre bilan.',
          content:
            'Une alimentation équilibrée, une activité physique régulière adaptée à son âge et des bilans périodiques auprès d’un médecin généraliste constituent les bases d’une prévention durable.\n\nContenu indicatif de démonstration en attente de validation par l’équipe médicale.',
          imageKey: 'hero',
          isMedicalApproved: false,
          isDemoContent: true,
          isPublished: true,
        },
      ])
      .onConflictDoNothing();
  }

  const galCount = await db.select({ total: count() }).from(galleryItems);
  if (Number(galCount[0]?.total || 0) === 0) {
    await db.insert(galleryItems).values([
      {
        title: 'Accueil lumineux et apaisant',
        caption:
          'Illustration d’ambiance médicale — environnement calme et chaleureux (visuel d’illustration générique).',
        imageUrl: '/src/assets/images/hero_clinique_ambiance_1794565298582.jpg',
        isAmbientIllustration: true,
        displayOrder: 1,
        isPublished: true,
      },
      {
        title: 'Espace de consultation spécialisée',
        caption:
          'Illustration d’ambiance médicale — cabinet de consultation attentive (visuel d’illustration générique).',
        imageUrl:
          '/src/assets/images/nephrology_care_ambiance_1794565298957.jpg',
        isAmbientIllustration: true,
        displayOrder: 2,
        isPublished: true,
      },
      {
        title: 'Accompagnement santé féminine et prénatale',
        caption:
          'Illustration d’ambiance médicale — écoute et suivi maternel (visuel d’illustration générique).',
        imageUrl:
          '/src/assets/images/womens_prenatal_ambiance_1794565299211.jpg',
        isAmbientIllustration: true,
        displayOrder: 3,
        isPublished: true,
      },
      {
        title: 'Pôle analyses et diagnostics',
        caption:
          'Illustration d’ambiance médicale — précision clinique et hygiène (visuel d’illustration générique).',
        imageUrl:
          '/src/assets/images/lab_diagnostics_ambiance_1794565299430.jpg',
        isAmbientIllustration: true,
        displayOrder: 4,
        isPublished: true,
      },
      {
        title: 'Prévention et dépistage chronique',
        caption:
          'Illustration d’ambiance médicale — entretien préventif et suivi tensionnel (visuel d’illustration générique).',
        imageUrl:
          '/src/assets/images/prevention_wellness_ambiance_1794565300205.jpg',
        isAmbientIllustration: true,
        displayOrder: 5,
        isPublished: true,
      },
    ]);
  }
}
