module.exports = async (req, res) => {
  res.setHeader('Set-Cookie', 'cb_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.status(200).json({ ok: true });
};
