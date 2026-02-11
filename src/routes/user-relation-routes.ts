import { Router } from 'express';
import { UserRelationService } from '../services/user-relation-service.js';
import { UserRelationController } from '../controllers/user-relation-controller.js';

const router = Router();

const service = new UserRelationService();
const controller = new UserRelationController(service);

// Crear solicitud de amistad
router.post('/:id/friend-request/:targetId', controller.sendRequest);

// Aceptar solicitud
router.post('/friend-request/:requestId/accept', controller.acceptRequest);

// Rechazar solicitud
router.post('/friend-request/:requestId/reject', controller.rejectRequest);

// Obtener amigos
router.get('/:id/friends', controller.getFriends);

// Solicitudes recibidas
router.get('/:id/friend-requests/received', controller.getReceivedRequests);

// Solicitudes enviadas
router.get('/:id/friend-requests/sent', controller.getSentRequests);

export default router;
