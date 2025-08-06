import yaml

def train(config_path='model_config.yaml'):
    with open(config_path) as f:
        cfg = yaml.safe_load(f)
    print(f"Training model {cfg['model_name']} for {cfg['num_epochs']} epoch(s)")

if __name__ == '__main__':
    train()
