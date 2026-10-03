-- Roles, permissions and the role → permission matrix.
-- Authorization is always enforced server-side from these rows (src/server/auth/rbac.ts).

INSERT INTO permissions (key, description) VALUES
  ('booking.read',     'View bookings and booking details'),
  ('booking.create',   'Create bookings on behalf of customers'),
  ('booking.update',   'Edit booking notes and details'),
  ('booking.accept',   'Accept pending bookings'),
  ('booking.reject',   'Reject pending bookings'),
  ('booking.cancel',   'Cancel bookings'),
  ('booking.reschedule','Move bookings to another slot'),
  ('booking.complete', 'Mark bookings completed or no-show'),
  ('customer.read',    'View customer records'),
  ('customer.update',  'Edit customer records'),
  ('service.read',     'View services'),
  ('service.write',    'Create, edit, activate or archive services'),
  ('pricing.read',     'View pricing'),
  ('pricing.write',    'Edit pricing'),
  ('staff.read',       'View staff'),
  ('staff.write',      'Manage staff'),
  ('schedule.read',    'View schedule and exceptions'),
  ('schedule.write',   'Edit working hours and exceptions'),
  ('blog.read',        'View blog posts'),
  ('blog.write',       'Create and edit blog posts'),
  ('blog.publish',     'Publish, schedule or unpublish posts'),
  ('seo.read',         'View SEO metadata'),
  ('seo.write',        'Edit SEO metadata'),
  ('settings.read',    'View settings'),
  ('settings.write',   'Change system settings'),
  ('audit.read',       'Read the audit log');

INSERT INTO roles (id, key, name, description) VALUES
  ('role_super_admin', 'SUPER_ADMIN', 'Super administrator', 'Full access including system settings and audit log'),
  ('role_admin',       'ADMIN',       'Administrator',       'Full operational access'),
  ('role_manager',     'MANAGER',     'Manager',             'Bookings, pricing, schedule and content oversight'),
  ('role_staff',       'STAFF',       'Staff',               'Front desk: bookings and customers'),
  ('role_editor',      'EDITOR',      'Editor',              'Blog and SEO content');

-- SUPER_ADMIN: everything
INSERT INTO role_permissions (role_id, permission_key)
SELECT 'role_super_admin', key FROM permissions;

-- ADMIN: every permission (kept as an explicit list so role intent stays readable)
INSERT INTO role_permissions (role_id, permission_key) VALUES
  ('role_admin', 'booking.read'), ('role_admin', 'booking.create'), ('role_admin', 'booking.update'),
  ('role_admin', 'booking.accept'), ('role_admin', 'booking.reject'), ('role_admin', 'booking.cancel'),
  ('role_admin', 'booking.reschedule'), ('role_admin', 'booking.complete'),
  ('role_admin', 'customer.read'), ('role_admin', 'customer.update'),
  ('role_admin', 'service.read'), ('role_admin', 'service.write'),
  ('role_admin', 'pricing.read'), ('role_admin', 'pricing.write'),
  ('role_admin', 'staff.read'), ('role_admin', 'staff.write'),
  ('role_admin', 'schedule.read'), ('role_admin', 'schedule.write'),
  ('role_admin', 'blog.read'), ('role_admin', 'blog.write'), ('role_admin', 'blog.publish'),
  ('role_admin', 'seo.read'), ('role_admin', 'seo.write'),
  ('role_admin', 'settings.read'), ('role_admin', 'settings.write'),
  ('role_admin', 'audit.read');

-- MANAGER: operations + schedule + pricing, no staff management, no system settings/audit
INSERT INTO role_permissions (role_id, permission_key) VALUES
  ('role_manager', 'booking.read'), ('role_manager', 'booking.create'), ('role_manager', 'booking.update'),
  ('role_manager', 'booking.accept'), ('role_manager', 'booking.reject'), ('role_manager', 'booking.cancel'),
  ('role_manager', 'booking.reschedule'), ('role_manager', 'booking.complete'),
  ('role_manager', 'customer.read'), ('role_manager', 'customer.update'),
  ('role_manager', 'service.read'), ('role_manager', 'service.write'),
  ('role_manager', 'pricing.read'), ('role_manager', 'pricing.write'),
  ('role_manager', 'staff.read'),
  ('role_manager', 'schedule.read'), ('role_manager', 'schedule.write'),
  ('role_manager', 'blog.read'),
  ('role_manager', 'settings.read');

-- STAFF: front desk
INSERT INTO role_permissions (role_id, permission_key) VALUES
  ('role_staff', 'booking.read'), ('role_staff', 'booking.create'), ('role_staff', 'booking.update'),
  ('role_staff', 'booking.accept'), ('role_staff', 'booking.reject'), ('role_staff', 'booking.cancel'),
  ('role_staff', 'booking.reschedule'), ('role_staff', 'booking.complete'),
  ('role_staff', 'customer.read'), ('role_staff', 'customer.update'),
  ('role_staff', 'service.read'),
  ('role_staff', 'pricing.read'),
  ('role_staff', 'schedule.read');

-- EDITOR: content only
INSERT INTO role_permissions (role_id, permission_key) VALUES
  ('role_editor', 'blog.read'), ('role_editor', 'blog.write'), ('role_editor', 'blog.publish'),
  ('role_editor', 'seo.read'), ('role_editor', 'seo.write'),
  ('role_editor', 'service.read');
