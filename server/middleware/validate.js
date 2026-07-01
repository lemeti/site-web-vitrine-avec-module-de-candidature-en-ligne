const { z } = require('zod');

// Schéma de validation pour le cycle d'entrée
const CycleIdSchema = z.enum(['1', '2', '3'], {
  message: "Cycle invalide. Valeurs acceptées: 1 (Licence 1ère année), 2 (Licence 3ème année), 3 (Master)"
});

// Schéma de validation pour la filière
const ProgramIdSchema = z.enum(['1', '2', '3', '4', '5', '6', '7'], {
  message: "Filière invalide. Valeurs acceptées: 1-7"
});

// Schéma de validation pour le centre
const CenterIdSchema = z.enum(['1', '2', '3', '4'], {
  message: "Centre invalide. Valeurs acceptées: 1 (Nkongsamba), 2 (Bafoussam), 3 (Douala), 4 (Yaoundé)"
});

// Schéma principal de validation pour les candidatures
const CandidatureSchema = z.object({
  // Identité
  last_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  
  first_name: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères')
    .trim(),
  
  birth_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (AAAA-MM-JJ)')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16 && age <= 60;
    }, 'L\'âge doit être compris entre 16 et 60 ans'),
  
  birth_place: z.string()
    .min(2, 'Le lieu de naissance est requis')
    .max(200, 'Le lieu de naissance ne peut pas dépasser 200 caractères')
    .trim(),
  
  gender: z.enum(['Femme', 'Homme', 'Autre'], {
    message: 'Genre invalide. Valeurs acceptées: Femme, Homme, Autre'
  }),
  
  nationality: z.string()
    .min(2, 'La nationalité est requise')
    .max(100, 'La nationalité ne peut pas dépasser 100 caractères')
    .trim(),
  
  // Contact
  phone: z.string()
    .regex(/^\+?\d{8,15}$/, 'Numéro de téléphone invalide (format: +237XXXXXXXXX)'),
  
  email: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .trim()
    .toLowerCase(),
  
  address: z.string()
    .min(5, 'L\'adresse est requise (minimum 5 caractères)')
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .trim(),
  
  // Choix de candidature
  cycle_id: CycleIdSchema,
  program_id: ProgramIdSchema,
  center_id: CenterIdSchema,
  
  payment_receipt_number: z.string()
    .min(1, 'Le numéro de reçu de paiement est requis')
    .max(100, 'Le numéro de reçu ne peut pas dépasser 100 caractères')
    .trim(),
  
  // Parcours académique
  last_degree: z.string()
    .min(2, 'Le dernier diplôme obtenu est requis')
    .max(200, 'Le diplôme ne peut pas dépasser 200 caractères')
    .trim(),
  
  school: z.string()
    .min(2, 'Le nom de l\'établissement est requis')
    .max(300, 'Le nom de l\'établissement ne peut pas dépasser 300 caractères')
    .trim(),
  
  graduation_year: z.string()
    .regex(/^\d{4}$/, 'Année d\'obtention invalide (format: AAAA)')
    .refine((year) => {
      const y = parseInt(year);
      return y >= 1980 && y <= new Date().getFullYear() + 1;
    }, `L'année doit être comprise entre 1980 et ${new Date().getFullYear() + 1}`),
  
  // Situation fonctionnaire (optionnel)
  is_civil_servant: z.boolean().optional(),
  
  civil_servant_details: z.string()
    .max(1000, 'Les détails ne peuvent pas dépasser 1000 caractères')
    .trim()
    .optional()
});

// Schéma de validation pour le formulaire de contact
const ContactSchema = z.object({
  name: z.string()
    .min(2, 'Le nom est requis (minimum 2 caractères)')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères')
    .trim(),
  
  email: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .trim()
    .toLowerCase(),
  
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères')
    .trim()
});

// Middleware de validation pour les candidatures
function validateCandidature(req, res, next) {
  try {
    const validatedData = CandidatureSchema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données de candidature invalides',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur de validation interne'
    });
  }
}

// Middleware de validation pour le contact
function validateContact(req, res, next) {
  try {
    const validatedData = ContactSchema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Données de contact invalides',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur de validation interne'
    });
  }
}

module.exports = {
  validateCandidature,
  validateContact,
  CandidatureSchema,
  ContactSchema
};