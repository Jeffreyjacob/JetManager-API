import { Request, Response, Router } from 'express';
import { Protect } from '../middlewares/authMiddleware';
import { OrganizationController } from '../controllers/organizationController';
import CacheMiddleware, { CacheService } from '../utils/cacheServices';

const organizationRoutes = Router();

const cacheMiddleware = new CacheMiddleware(new CacheService());

/**
 * @openapi
 * /api/v1/organization/create:
 *   post:
 *     summary: Create a new organiation
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrganizationRequest'
 *     responses:
 *       200:
 *         description: Organization Created Successfully, You have to clicked on stripe checkout url provided after sucessfully creation of organization, since it's testing mode,you can use stripe test cards [ 4242424242424242 , 4000056655665556, 5555555555554444] and put any expiry date or cvv number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateOrganizationResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/create')
  .post(
    Protect,
    cacheMiddleware.invalidate('auto:/organization/create*'),
    OrganizationController.createOrganizationController
  );

/**
 * @openapi
 * /api/v1/organization/invite/send:
 *   post:
 *     summary: send organization invitation to user to join Organization
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOrganizationInviteRequest'
 *     responses:
 *       200:
 *         description: Your invite has been sent successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendOrganizationInviteResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/invite/send')
  .post(Protect, OrganizationController.sendOrganizationInviteController);

/**
 * @openapi
 * /api/v1/organization/invite/accept:
 *   post:
 *     summary: Accepting an Organizational invite
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcceptOrganizationInviteRequest'
 *     responses:
 *       200:
 *         description: You has been added to organization!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcceptOrganizationInvaiteResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/invite/accept')
  .post(Protect, OrganizationController.acceptOrganizationInviteController);

/**
 * @openapi
 * /api/v1/organization/member/remove:
 *   delete:
 *     summary: Removing member from an organization
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveMemberFromOrganizationRequest'
 *     responses:
 *       200:
 *         description: Member has been remove successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoveMemberFromOrganizationResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/member/remove')
  .delete(
    Protect,
    cacheMiddleware.invalidate('auto:/member'),
    OrganizationController.removeMemberFromOrganization
  );

/**
 * @openapi
 * /api/v1/organization/member/role/update:
 *   put:
 *     summary: updating member role in an organization
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateMemberOrganizationRoleRequest'
 *     responses:
 *       200:
 *         description: Member role has been updated successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/updateMemberOrganizationRoleResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/member/role/update')
  .put(
    Protect,
    cacheMiddleware.invalidate('auto:/member/role'),
    OrganizationController.updateMemberOrganizationRole
  );

/**
 * @openapi
 * /api/v1/organization:
 *   get:
 *     summary: Get all organizations (Both Owner or Worker)
 *     description: Retrieve members of a specific organization, with optional filters such as member name, page, and limit.
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: query
 *         search: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter organization by name(case-insensitive)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Organizations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAllUserOrganizationResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/')
  .get(
    Protect,
    cacheMiddleware.response(300),
    OrganizationController.getAllUserOrganization
  );

/**
 * @openapi
 * /api/v1/organization/{orgId}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization
 *     responses:
 *       200:
 *         description: Organization retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetOrganizationByIdResponse'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/:orgId')
  .get(
    Protect,
    cacheMiddleware.response(300),
    OrganizationController.getOrganizationById
  );

/**
 * @openapi
 * /api/v1/organization/{orgId}/member:
 *   get:
 *     summary: Get all members of an organization
 *     description: Retrieve members of a specific organization, with optional filters such as member name, page, and limit.
 *     tags: [Organization]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter members by user first name (case-insensitive)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Members fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetOrganizationMemberResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
organizationRoutes
  .route('/:orgId/member')
  .get(
    Protect,
    cacheMiddleware.response(300),
    OrganizationController.getOrganizationMember
  );

organizationRoutes
  .route('/:id/billing/success')
  .get(async (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      mesage: 'billing success',
    });
  });

organizationRoutes
  .route('/:id/billing/cancel')
  .get(async (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      mesage: 'billing success',
    });
  });

export default organizationRoutes;
