// Shared schema plugin: expose `id` instead of `_id`, drop `__v`,
// and let individual schemas hide sensitive fields (e.g. passwordHash)
// via `select: false` on the field itself.
function toJSONPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.passwordHash
      return ret
    }
  })
}

module.exports = toJSONPlugin
