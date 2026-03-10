import { Router } from 'express';
import { UserRelationController } from '../controllers/user-relation-controller.js';
import { userService, relationService } from '../services/instances.js';

const router = Router();

const controller = new UserRelationController(relationService, userService);

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

// Update perfil (nombre, foto)
router.put('/:id/profile', controller.updateProfile);

// Delete cuenta (dejar la red)
router.delete('/:id/account', controller.deleteAccount);

export default router;
