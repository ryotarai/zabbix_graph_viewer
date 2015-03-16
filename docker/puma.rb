require 'fileutils'

log_dir = ENV['LOG_DIR_PATH'] || '/log'
FileUtils.mkdir_p(log_dir)
stdout_redirect File.join(log_dir, 'puma-stdout.log'), File.join(log_dir, 'puma-stderr.log')

listen_unix = ENV['LISTEN_UNIX']

if listen_unix
  bind "unix://#{listen_unix}"
end

port = ENV['PORT'] || 8080
bind "tcp://0.0.0.0:#{port}"
